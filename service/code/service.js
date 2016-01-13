//2 canales, uno de entrada y otro de salida
//para comunicar con un contenedor
// Lanzar contenedor de la siguiente manera:
//docker run -p 8000:8000 -p 8001:8001 -a STDOUT component/component
var exec=require('child_process').exec
var zmq=require('zmq');
var fs = require('fs');
var pck_json=fs.readFileSync('../package.json','utf8')

var service = JSON.parse(pck_json);
var pull = zmq.socket('pull');
var push = zmq.socket('push');

pull.connect("tcp://localhost:8001",function(err){
    if(err) console.log("bind fail")
});
pull.on("message", function(msg){
    console.log(msg.toString())
})


push.connect("tcp://localhost:8000",function(err){
    if(err) console.log(err);
    console.log("connected")
})
setInterval(function(){
    push.send("hola")
}, 1000);


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

/*pub.bindSync('tcp://*:8001',function(err){
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
			console.log("Sockets enviados")	},10000);
            }*/