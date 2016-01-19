var fs=require('fs');
var zmq = require('zmq');
var pack_json=fs.readFileSync('../package.json','utf8');
var component = JSON.parse(pack_json);

//fs.writeFile("hola.txt",'hola')
//var serviceEndPoint = process.argv[1]

console.log("Mi stdout");
var sub = zmq.socket('sub');

sub.connect('tcp://localhost:8001');
sub.subscribe("comp1");

sub.on("message", function (msg) {
	console.log(msg);
})

var pull = zmq.socket('pull');
var push = zmq.socket('push');
pull.bind('tcp://0.0.0.0:8000',function(err){
	if(err) console.log(err);
    console.log('conectado')
    pull.on("message", function(msg){
        console.log(msg.toString());
    })
});


push.connect('tcp://comp2-0:8000', function(err){
    console.log(err);
})

setInterval(function(){
    push.send("Soy el componente")
    //console.log("envio")
}, 5000)

