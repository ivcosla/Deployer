// TODO!!!!: Find another way to set the host and port arguments.
// Now arguments has to be: [input-ports]* ([output-host][output-port])*
// The runtime requires the name of the "main.js" in each component to be
// "component.js"

var cJson = require('../package.json')
var zmq = require('zmq')
// Gets the names of the components that this component
// haves an output connection with througth arguments
var args = process.argv.slice(2)
console.log(args)

// Endpoint object and methods. It can bind and connect accepting a callback,
// but with host and port predefined for socket injection. Other methods from
// zmq have to be called by 'socket' property. Ex.: i1.socket.push('Hi')

var Endpoint = function(host,port,sock){
    this.socket = zmq.socket(sock);
    this.host = host;
    this.port = port;
}
Endpoint.prototype.bind = function(callback){
    //console.log('host:',this.host,'port:',this.port,'socket:',this.socket)
    if(callback==undefined)
        this.socket.bind('tcp://'+this.host+':'+this.port);
    else
        this.socket.bind('tcp://'+this.host+':'+this.port,callback);
}

Endpoint.prototype.connect = function(callback){
    //console.log('host:',this.host,'port:',this.port,'socket:',this.socket)
    if(callback==undefined)
        this.socket.connect('tcp://'+this.host+':'+this.port);
    else
        this.socket.connect('tcp://'+this.host+':'+this.port,callback);
}
// Object endpoints: Dictionary with the sockets.
// Global scope
endpoints={};

// Loops througth input-connection
var inConns = cJson.connections['input-connection'];

var index = 0;
for (var endPName in inConns){
    endpoints[endPName] = new Endpoint('localhost',args[index++],inConns[endPName]);
}

// Loops througth output-connection
var outConns = cJson.connections['output-connection'];

for (var endPName in outConns){
    endpoints[endPName] = new Endpoint(args[index++],args[index++],outConns[endPName]);
}

require('./component.js')