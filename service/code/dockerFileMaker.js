// This script makes a Dockerfile file merging default
// parameters (such Linux image, nodejs and zmq installation)
// with parameters taken from a given JSON file. The Dockerfile
// will be made at the same location that the JSON file is.

var fs = require('fs')

var jsonFile;

// filename: Path to the json
function setJson(filename){
    jsonFile = require(filename);
}

function writeDependencies(){
    var res='';
    var dependencies = jsonFile.dependencies
    
    // dependencies de la forma:
    // "d1":"node:tar". Divido
    // en dos y aplico en consecuencia
    for(var dep in dependencies ){
        var list = dep.split(':');
        if(list[0]=='system'){
            res=res+'RUN  '+'apt-get install -y '+list[1]+'\n';
        }
        if(list[1]=='node'){
            res=res+'RUN  '+'npm install '+list[1]+'\n';  
        }     
    }
    // devuelve las instrucciones de dependencias
    return res;    
}