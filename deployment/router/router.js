// Arguments: type, input-port, ([output-host][output-port])+
var zmq = require('zmq')

var args = process.argv.slice(2)[0]
args = args.split(' ')
args.splice(args.length-1)
console.log(args)

//Socket initialization:
// Input socket
setTimeout(function(){
    var isock = zmq.socket('pull');

    // Array of output sockets
    var endpoints = [];
    var index = 0;
    for (var i=2; i<args.length; i=i+2)
    {
        var targetHost = args[i];
        var targetPort = args[i+1]; 
            
        endpoints[index] = zmq.socket('push');
        endpoints[index].connect('tcp://'+targetHost+':'+targetPort,
        function(err){
            if(err) console.log(err);
        });
        index++;
    }

    // Propagates the msg, the output socket is choosen depending on the router type.
    switch(args[0])
    {
        case "rand":
            isock.bind("tcp://*:"+args[1],function(){
                isock.on("message",function(msg){
                    var target = Math.floor(Math.random()*endpoints.length)
                    endpoints[target].send(msg);
                    console.log('msg redirected to socket',target);
                })
            })
        break;
        
        case "round-robin":
            var rrIndex = 0;
            isock.bind("tcp://*:"+args[1],function(){
                isock.on("message",function(msg){
                    endpoints[rrIndex].send(msg);
                    console.log('msg redirected to socket',rrIndex);        
                    rrIndex++;
                    if(rrIndex == endpoints.length) rrIndex=0;
                })
            })
        break;
    }
},65000);