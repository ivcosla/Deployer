// TODO: Parse graph and create channels

var projectPath = '../../'

// Asign a port to each component endpoint
// port range: 50000 + 
function setCompPorts(sJson,paths){
    var initPort = 50000;
    // resList: Dictionary of dictionaries -> {comp:{ (endpoint:port)* }}
    var resList;
    var portIndex = 0;
    for (var comp in sJson.components){
        var cJson = require(paths[comp]+'/package.json');
        
        var inConns = cJson.connections['input-connection'];
        resList[comp] = {}         
        for (var endp in inConns){
            resList[comp][endp] = initPort + portIndex; portIndex++;
        }
                       
    }
    
    return resList;
}

function parse(sJson,paths){
    var graph = sJson.graph;
    var inSocketList = setCompPorts(sJson,paths);
    var outSocketList = {};
    
    for (var channel in graph){
        //channel.source.   
        if(channel.type=="point-to-point"){
            
        }     
    }
}