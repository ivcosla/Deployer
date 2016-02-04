# Docker Deployer

### Description
Service deployer. Deploys a service hosting its components inside docker containers.
Made in Java-Script, using zmq for socket communication.

### Prerequisites
Docker version > 1.9.1

#### Additional dependencies
* [dockerode](https://www.npmjs.com/package/dockerode)
* [tar.gz](https://www.npmjs.com/package/tar.gz)

#### Images
You need to build those two images from the folders explained below. You must name
the images with the correct name:

* **component/base** -> build with the Dockerfile in root directory.
* **channel/lb** -> build with the deployment/router/ Dockerfile.

### Usage and further explanation
You need to configure each package.json in each directory as explained below. 
Advice: take a look at the examples .json in the project directory.

Once configured you has to package each component directory and service directory in differents .tgz files without parent directory.
Notice that each component main must be called component.js.

Finally you move inside deployment/code/ and run deployer.js providing two arguments explained below.


#### Directories
The directory of this app is the one named "deployment". In this version the service must be placed in
a directory named "service". The component directories may have different names. In this version you are only
able to deploy multiple instances of one single service.

Service and component directories must be compressed as .tgz files

**IMPORTANT** The .tgz files must be compressed withouth their parent directory. 
As an example, move to the component directory and execute:
`tar -cvfz ../componente.tgz *

The service and components provided are an example of how to configure them in order to be used by deployer.js

In the deployment/ directory must be an "uriDictionary.json" that translates the uri given to the service in an
specific location. In this version this "location" must be a local path to the service.tgz. In further versions
it will be able to retrieve the .tgz from an url.

`
In the same way it must be another uriDictionary.json in the service directory with the rules to translate each component
uri into a path to each component.tgz.

Each .tgz found this way will be "cached" into a directory hierarchy build from the component uri. The cached tgz
files are placed inside deployment/cache at its respective directory.

Is considered components with different uris to be different components, even if they .tgz is the same .tgz, this
is done because a change in an uri may denote a different version of the component.

*  __Requeriments for component directories__

All the code component code that you want to be executed must be placed in "yourcomponent/code/". Your main must be
called "component.js" because it will be run by a runtime that will inject the endpoints of your component into your main.

An example of valid component directory before be compressed:

```bash
    component/
    ├── code
    │   └── component.js
    └── package.json
```


* ##### Work space used by the deployer
El deployer will extract the .tgz files in rhe root of this project:
    ```
    Project directory before run node deployment/code/deployer.js:
    proyecto/
    ├── component.tgz
    ├── component2.tgz
    ├── deployment
    └── service.tgz
    
    Project directory after run deployment/code/deployer.js:
    proyecto/
    ├── comp1
    ├── comp2
    ├── component.tgz
    ├── component2.tgz
    ├── deployment
    ├── service
    └── service.tgz
    
    ```
    
    
#### Arguments
Arguments for deployer.js

Two input arguments:
* Argument 1: An string to add to the name of each instance of each container and to the
service net. The deployer will name each container with the name given to the component 
(in service/package.json) and a '-cardinality' string attached to it. Then the string provided
as argument will be attached to in order to avoid name collision, so the user is responsible
to give different strings in each deployment of its service to avoid the name collision problem.

An example:

```
The first container of component 1 will be named as "comp1-0". Then if argument 1 was "hey" it will be added to and
thereforce named "comp1-0-hey".
```

* Argument 2: Host port to map the entrypoint's port. Different port to map in each deployment avoids
port collision.

#### Client code
The user may write its components code withouth worrying about which port has each component. The runtime will inject
into the component.js a global object called "endpoints", that will have each component endpoint configured with
the port it needs to communicate trougth the specified communication graph (in /service/package.json).

endpoints is a collection of zmq sockets inside another object called endpoint that has the host and port configured.
The endpoints have the methods `bind(callback)` and `connect(callback)`. The callback is optional. Each other method 
from zmq sockets that you want to use you have to do it throught endpoints.endpoint.socket attribute. 

An example:

```javascript
    endpoints.i1.bind(function(err){
        if(err) console.log(err);
        console.log('conectado')
        endpoints.i1.socket.on("message", function(msg){
            console.log(msg.toString());
        })
    });
```

#### Further work

- [ ] Add pub/sub channels

- [ ] Add non-anonymous channels

- [ ] Add another argument to receive the package.json that now is in "deployment/" so different services can be
run in each execution of deployment/code/deployer.js

- [ ] Monitorization of the containers

#### JSON

Functionality and values of each attribute inside each package.json

* ##### package.json inside deployment/

    * **url:** url of the deployment. Useless in this version.
    
    * **servicio:** service uri to be translated inside uriDictionary.json. In further versions it will has different use if
    the header is file:// or if it is https://. 
    
    * **cardinality:** Dictionary which keys are the kind of component and the value its number of instances.
    
    * **params:** Useless in this version.
    
* ##### package.json del directorio service

    * **uri:** Same uri that in deployment/package.json service attribute.
    
    * **components:** Dictionary key-value which keys are the kind of service components and the value is the
    component uri.
    
    * **graph:** Graph with the description of the different communication channels between components. Is a dictionary which keys
    are the channel names and its values are another dictionaries describing the channel.
    
        * **type:** Channel type, two values admitted:
        
            1. "point-to-point". Directional channel A -> B. If both A and B have cardinalities > 1 then all A instances will communicate
            only with B first instance.
            
            2. "lb". Load balancer channel, it is directional A -> B. Each instance of A can send messages and only one instance of B will
            be the receiver each time. It has a "sub-type" attribute.
            
        * **sub-type:** "rand" if the instance of B is chosen randomly each time or "round-robin" if you want them to be selected on
        by one in order.
        
        * **source:** A dictionary describing the source endpoint of the channel.
            
            * **comp:** Kind of component that will be the source component. 
            
            * **endpoint:** Endpoint of the component "comp" that sends the messages.
            
        * **destination:** A dictionary describing the destination endpoint of the channel:
        
            * **comp:** Kind of component that will be the destination of the channel.
            
            * **endpoint:** Component endpoint that listens as the end of the channel.
            
    * **entrypoint:** Dictionary with the component endpoint that will be the entrypoint of the service.
    
        * **comp:** Component where the entrypoint is located.
        * **endpoint:** endpoint to be mapped to host port.
        
    * **params:** Useless in this version.
    
    * **dependencies:** Dictionary containing the dependencies to be installed in the component container: The key is a symbolic
    name to the dependencie, the value is the dependencia, it can be of two types, system or node dependency, fashioned in the next way: 
    
        1. "system:package_name" package will be installed with apt-get install -y package_name
        2. "node:package_name" package will be installed with npm install package_name
        
* ##### package.json in the directory of each component.

    * **Connections:** Dictionary describing input and output endpoints:
        
        * **input-connection:** For input sockets. Dictionary with key: endpoint name, value: zmq socket type.
        * **output-connection:** For output sockets. Dictionary with key: endpoint name, value: zmq socket type.
    * **Params:** Useless in this version.