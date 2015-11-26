var exec=require('child_process').exec
var zmq=require('zmq');
var fs = require('fs');
var pck_json=fs.readFileSync('../package.json','utf8')

var service = JSON.parse(pck_json);
var pub = zmq.socket('pub');
//IP por defecto MV: 192.168.99.100
//pub.bindSync("tcp://*:8000");
//pub.bindSync("tcp://192.168.99.100:8000",function(err){
//	if(err) throw(err);
//})

//Lanzar a ejecución cada componente.
//Cambiar a ejecución en docker.
//for (var a in service.components){
//	console.log("Ejecuto: ");
//	console.log(service.components[a]);
//	exec('node '+service.components[a],
//		function(err,stdout,stderr){});
//}

//Envía información a cada componente por cada
//canal del grafo, para que puedan configurarse
/*for (var a in service.graph[0]){
	var canal=service.graph[0][a];
	var tipo_canal = canal.tipo;
	
	console.log("Envío a: ");
	console.log(canal.source.comp)
	
	//Timeout necesario para asegurar que los
	//componentes se suscriben antes de envíar
	setTimeout(function(){
			pub.send([canal.source.comp,
			canal.source.endpoint+'source']);
			
			pub.send([canal.destination.comp,
				canal.destination.endpoint+
				'destination']);
				
			console.log("Sockets enviados")
		},10000);*/
		
	var push = zmq.socket('push');
	//push.connect('tcp://*:8000',function(err){
	push.connect(process.env.C1_PORT ,function(err){	
		if(err) throw err;
		console.log("connected")
	})
		setInterval(function(){
			push.send("hola")
			}, 1000);
//}