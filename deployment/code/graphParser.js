// TODO: Parse graph and create channels


// Asign a port to each component endpoint
// port range: 50000 + 
function setCompPorts(sJson,paths){
    var initPort = 50000;
    // resList: Dictionary of dictionaries -> {comp:{ (endpoint:port)* }}
    // outSocketList: Dictionary of out socket initialized for each component
    // values will be added in parse function.
    var resList={};
    var outSocketList = {};
    
    var portIndex = 0;
    for (var comp in sJson.components){
        var cJson = require(paths[comp]+'/package.json');
        
        var inConns = cJson.connections['input-connection'];
        resList[comp] = {}
        outSocketList[comp] = {}         
        for (var endp in inConns){
            resList[comp][endp] = initPort + portIndex; portIndex++;
        }
        portIndex = 0;              
    }
    
    return [resList,outSocketList];
}

function parse(dJson,sJson,paths){
    var graph = sJson.graph;
    var socketLists = setCompPorts(sJson,paths);
    var inSocketList = socketLists[0];
    var outSocketList = socketLists[1];
    // Add "lb" entry and the channel in both inSocketList and outSocketList
    inSocketList['lb']={};
    outSocketList['lb']={};
    
    // For each channel we take the destination component and endpoint,
    // then we can retrieve the port that we assigned before to that endpoint.
    // The output port will be the input port that we retrieved, also we keep the
    // component as the direction
    
    // If the channel is not point to point then we need to redirect the connection to
    // another container that represents the channel and behaves as a router
    for (var channel in graph){
        var cde = graph[channel].destination.endpoint;
        var cdc = graph[channel].destination.comp;
        
        var cse = graph[channel].source.endpoint;
        var csc = graph[channel].source.comp;
        
        // Each entry: { dest_host: { source_ep:port }}
        if(graph[channel].type=="point-to-point"){

            outSocketList[csc][cdc+'-0']={};
            outSocketList[csc][cdc+'-0'][cse] = inSocketList[cdc][cde];  
        }     
    
        if(graph[channel].type=="lb"){
            // then deployment.js has to read the lb entry and deploy a container for each
            // channel.
            inSocketList['lb'][channel] = inSocketList[cdc][cde];
            outSocketList['lb'][channel] = {};
            outSocketList[csc][channel]={};
            outSocketList[csc][channel][cse] = inSocketList[cdc][cde];
            
            var lbTargetCardinality = dJson.cardinality[cdc];
            for (var i = 0; i < lbTargetCardinality; i++ ){
                outSocketList['lb'][channel][cdc+'-'+i] = inSocketList[cdc][cde];       
            }            
        }
    }
    
    return [inSocketList, outSocketList]
}

module.exports = {
    setCompPorts: setCompPorts,
    parse: parse
}