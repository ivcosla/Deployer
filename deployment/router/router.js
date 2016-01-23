// Arguments: type, input-port, ([output-host][output-port])+
var zmq = require('zmq')

var args = process.argv.slice(2)
console.log(args)

//Socket initialization:
// Input socket
var isock = zmq.socket('pull');

// Array of output sockets
var endpoints = [];
var index = 0;
for (var i=2; i<args.length; i=i+2)
{
    var targetHost = args[i];
    var targetPort = args[i+1]; 
        
    endpoints[index] = zmq.socket('push');
    endpoints[index].connect('tcp://'+targetHost+':'+targetPort);
}

// Propagates the msg, the output socket is choosen depending on the router type.
switch(args[0])
{
    case "rand":
        isock.bind("tcp://*:"+args[1],function(){
            isock.on("message",function(msg){
                endpoints[Math.floor(Math.random()*endpoints.length)].send(msg);
            })
        })
    break;
    
    case "round-robin":
        var rrIndex = 0;
        isock.bind("tcp://*:"+args[1],function(){
            isock.on("message",function(msg){
                endpoints[rrIndex].send(msg);
                rrIndex++;
                if(rrIndex == endpoints.length) rrIndex=0;
            })
        })
    break;
}