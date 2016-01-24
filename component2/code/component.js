var fs=require('fs');
var zmq = require('zmq');
var pack_json=fs.readFileSync('../package.json','utf8');
var component = JSON.parse(pack_json);

setTimeout(function(){
    //var serviceEndPoint = process.argv[1]

    endpoints.o1.connect(function(err){
        if(err) console.log(err)
    });
    setInterval(function(){
        endpoints.o1.socket.send('hola')
    },10000);

    endpoints.i1.bind(function(err){
        if(err) console.log(err)
        endpoints.i1.socket.on('message',function(msg){
            console.log(msg.toString())
        })
    })
},30000);