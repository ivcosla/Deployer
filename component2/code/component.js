var fs=require('fs');
var zmq = require('zmq');
var pack_json=fs.readFileSync('../package.json','utf8');
var component = JSON.parse(pack_json);

setTimeout(function(){
    //var serviceEndPoint = process.argv[1]
    var push = zmq.socket('push');
    var pull = zmq.socket('pull');

    push.connect('tcp://comp1-0:8000',function(err){
        if(err) console.log(err)
    });
    setInterval(function(){
        push.send('hola')
    },10000);

    pull.bind('tcp://*:8000',function(err){
        if(err) console.log(err)
        pull.on('message',function(msg){
            console.log(msg.toString())
        })
    })
},30000);