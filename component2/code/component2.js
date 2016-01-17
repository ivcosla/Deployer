var fs=require('fs');
var zmq = require('zmq');
var pack_json=fs.readFileSync('../package.json','utf8');
var component = JSON.parse(pack_json);

//var serviceEndPoint = process.argv[1]
var sub = zmq.socket('sub');
sub.connect('tcp://localhost:8000');
sub.subscribe("comp2");

sub.on("message",function(msg){
	console.log(msg);
})
