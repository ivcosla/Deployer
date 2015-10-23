var fs=require(fs);
var pack_json=fs.readSync('../package.json','utf8');
var component = JSON.parse(pack_json);

component.outSocket.send("Hola");
component.inSocket.on("message",function(mes){
	console.log(mes);
})