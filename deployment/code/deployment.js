var exec=require('child_process').exec

var fs = require('fs');
var pck_json=fs.readSync('../package.json','utf8')
var deployment = JSON.parse(pck_json);

for(i=0;i<deployment.servicios.length;i++){
	//Lanzar otro script o imagen de docker
	var cmd='node ../'+servicios[i]+'/code/'+servicios[i]+' ';
	//Argumentos: ejemplo pasando sockets
	//cmd+=
	exec(cmd,function(err,stdout,stderr){});
}