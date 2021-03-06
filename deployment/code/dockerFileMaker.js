// This script makes a Dockerfile file merging default
// parameters (such Linux image, nodejs and zmq installation)
// with parameters taken from a given JSON file. The Dockerfile
// will be made at the same location that the JSON file is.
// The default parameters are taken by using a base image.

// Additional dependencies:
// -> tar.gz (npm install tar.gz)
var TGZ = require('tar.gz')
var fs = require('fs')

module.exports=function(){
    // filename: Path to the json
    this.getJson = function(filename){
        return require(filename);
        }
        
    // This function gets the dependencies required to be installed
    // on the setup of the image (they have to be on the Dockerfile)
    // and returns them on a string variable

    this.writeDependencies = function(filename){
        var res='';
        var dependencies = filename.dependencies
        
        // dependencies written like:
        // "d1":"node:tar".
        // split in two and working accordingly 
        for(var dep in dependencies ){
            var list = dependencies[dep].split(':');
            if(list[0]=='system'){
                res=res+'RUN  '+'apt-get install -y '+list[1]+'\n';
            }
            if(list[0]=='node'){
                res=res+'RUN  '+'npm install '+list[1]+'\n';  
            }     
        }
        return res;    
    }

    // Finally this function creates the Dockerfile given
    // the path to the component. Also copies the runtime to
    // the component path.
    // Example input directory:
/*    component
        ├── code
        │   └── component.js
        └── package.json
       
       Example output directory:
        component
        ├── code
        │   ├── component.js
        │   └── runtime.js
        ├── Dockerfile
        └── package.json       
        
 */


    this.composeDockerfile = function (pathToComponent, serv){
        //var comp = this.getJson(pathToComponent+'package.json');
        //var serv = this.getJson(pathToService+'package.json');
        var res = 'FROM component/base\nRUN mkdir component\n'+
                'COPY . /component/ \n'+'WORKDIR "/component/code"\n'
                
        res=res+this.writeDependencies(serv);

        //res=res+ 'CMD ["nodejs","component.js"]'
        fs.writeFileSync(pathToComponent+'Dockerfile',res);
        var runtimef = fs.readFileSync('./runtime/runtime.js');
        fs.writeFileSync(pathToComponent+'/code/runtime.js',runtimef);
    }
}