var fs = require('fs');

var TGZ = require('tar.gz');
var tgz = new TGZ();
var projectPath = '../../';

var exec = require('child_process').execSync;
var dUriD = require(projectPath+'uriDictionary.json');
var cache = require(projectPath+'cache/cache.json');


// This function checks if the service/component.tgz is in
// the cache, if it is, then returns the path in the cache
// to the .tgz. If it is not, then it makes a directory in
// the cache to host the .tgz and places the .tgz in it, finally
// it returns the path in cache for the new .tgz.

var retrieve = function(uri, uriD){
    // Check the cache: If the uri is in the caché
    // then it returns the path in cache to the tgz.
    if (cache[uri] != undefined)
        return cache[uri]; 
    else{
        // We remove all characters at the left of '//'
        var dirHierarchy = uri.split('//')
        dirHierarchy = dirHierarchy[1].split('/')
        var pathD = '';
        
        // We made the directory hierarchy
        for (var folder in dirHierarchy){
            pathD = pathD + dirHierarchy[folder] + '/'
            if (!fs.existsSync(projectPath+'cache/'+pathD))
                fs.mkdir(projectPath+'cache/'+pathD)
        }
        // The directory is complete. We retrieve the .tgz
        // Get the name.tgz from the uri dictionary value
        var uriValuSplited = uriD[uri].split('/');
        var tgzName = uriValuSplited[uriValuSplited.length-1];
        
        var source = fs.readFileSync(projectPath+uriD[uri]);
        fs.writeFileSync(projectPath+'cache/'+pathD + tgzName, source);
        
        // Add the uri to the cache
        var completePath = pathD+tgzName
        cache[uri] = completePath;
        
        // Write the cache json
        fs.writeFileSync(projectPath+'cache/cache.json',JSON.stringify(cache))
        
        console.log(pathD)
        // Return the path
        return completePath
    }
}
var solve = function(dJson){
    // Return parameter: A dictionary object that contains:
    // key: name of component/service. value: path
    var res={};
    
    // First step: The service is extracted
    var suri = dJson.service;
    
    // Get the path to the tgz from the cache and extract
    var pathD = retrieve(suri, dUriD);
    if(!fs.existsSync('../'+projectPath+'service'))
        fs.mkdirSync('../'+projectPath+'service');
    exec('tar -C ../'+projectPath+'service -zxvf'+ projectPath+'cache/'+pathD)
    res['service'] = '../'+projectPath+'service';
    // Now that the service is extracted we can read its Jsons         
    //var sJsonR = fs.readFileSync('../../service/package.json')
    var sJson = require('../'+projectPath+'service/package.json')
    
    var sUriD = require('../'+projectPath+'service/uriDictionary.json')            
    
    // For each component we solve its uri and then we extract it.
    for (var comp in sJson.components){
        var curi = sJson.components[comp]
        // Retrieve each component path to its tgz in the cache
        // and extract.
        var cpath = retrieve(curi,sUriD);
        tgz.extract(projectPath+'cache/'+cpath,'../'+projectPath+comp)
        res[comp] = '../'+projectPath+comp 
            
    }
    return res;  
}

module.exports = {
    retrieve: retrieve,
    solve: solve
}