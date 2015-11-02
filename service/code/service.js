var exec=require('child_process').exec
var zmq=require('zmq');
var fs = require('fs');
var pck_json=fs.readFileSync('../package.json','utf8')

var service = JSON.parse(pck_json);
var pub = zmq.socket('PUB');
pub.bindSync("tcp://localhost:8000");

//Lanzar a ejecución cada componente.
//Cambiar a ejecución en docker.
for (var a in service.components){
	exec('node',service.components[a],
		function(err,stdout,stderr){});
}

//Envía información a cada componente por cada
//canal del grafo, para que puedan configurarse
for (var a in service.graph[0]){
	var canal=service.graph[0][a];
	var tipo_canal = canal.tipo;
	
	pub.send(canal.source.comp+
		canal.source.endpoint+'source');
	
	pub.send(canal.destination.comp+
		canal.destination.endpoint+
		'destination');
	
	}