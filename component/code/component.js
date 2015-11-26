var fs=require('fs');
var zmq = require('zmq');
var pack_json=fs.readFileSync('../package.json','utf8');
var component = JSON.parse(pack_json);

//fs.writeFile("hola.txt",'hola')
//var serviceEndPoint = process.argv[1]

console.log("Mi stdout");
/*var sub = zmq.socket('sub');
sub.connect('tcp://localhost:8000');
sub.subscribe("comp1");

sub.on("message", function (msg) {
	console.log(msg);
})*/

var pull = zmq.socket('pull');
pull.bind('tcp://*:8000',function(err){
	if(err) throw err;
});
pull.on("message", function(msg){
	console.log(msg.toString());
})
