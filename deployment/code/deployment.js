var dJson = require("../package.json");
var exec = require('child_process').execSync; 
var EvEm = require('events').EventEmitter;
const util = require('util');

// MyEmitter inherits from events class
function MyEmitter() {
  EvEm.call(this);
}
util.inherits(MyEmitter, EvEm);

// Own event emitter instance
const myEmitter = new MyEmitter();

// Additional dependencies
var Docker = require("dockerode");
var docker = new Docker();

// For tailoring the dockerfiles of each component
var Dfm = require("./dockerFileMaker.js");
var dfm = new Dfm();

// For solving uri, retrieving .tgz and updating cache
var uriSolver = require("./uriSolver.js");

// For assign ports and address to each endpoint acording to the graph
var graphParser = require("./graphParser.js");

// For convert the graphParser dictionaries into arguments for containers
var argumentsParser = require("./argumentsParser.js");

// Deployer receives an "ID" from arguments that will be attached to the network and 
// component names in order to avoid name collision when multiple instances of
// the same service are deployed. For example, if id = 2 then possible names for
// network and components will be: deployernet-2, channel1-2, comp1-0-2.
var args = process.argv.slice(2);
var id = args[0];

var paths = uriSolver.solve(dJson);
console.log(paths)
var sJson = require(paths['service']+'/package.json');
// Create network for the containers. Feature introduced in Docker 1.9.1.
exec('docker network create deployernet'+'-'+id);

// loops througth each component and makes a Dockerfile
// at the top of its directory
var components = sJson.components;
for (var comp in components){
    dfm.composeDockerfile(paths[comp]+'/',sJson)  
    // In order to build images from the Api, the directory
    // containing the Dockerfile and code must be compressed
    // as tar. Dockerfile must be in root of the tar.
    
    // Using system call instead of nodejs library.
    exec('tar -C '+paths[comp]+'/ -cvf ../'+comp+'.tar'+' .')
    console.log('Building image for: '+comp+'...');
    
    // Wrapper so the value comp is the original from each invocation of
    // buildImage (in its callback). docker.modem.followProgress is necessary
    // to fire onFinished event when the image is built.
    (function(originalValueComp){
        docker.buildImage('../'+originalValueComp+'.tar',{t: 'component/'+originalValueComp},
            function(err, data){
                if (err) console.log(err)
                docker.modem.followProgress(data,onFinished);
                
                function onFinished(err, output){
                    if (err) console.log(err)
                    console.log('component/'+originalValueComp+' image created')
                    
                    // Once the image is created we can proceed to run every copy
                    // of the container from the image.
                    myEmitter.emit('buildFinish',originalValueComp)                
                }
            })
    })(comp);
}
// TODO: pass arguments on docker.run. Create image for lb channel. Unequivoque names for
// every service network and container.
   
var sockts = graphParser.parse(dJson,sJson,paths,id)
var inSockts = sockts[0]; var outSockts = sockts[1];

// First we deploy possible channels (check if there is at least one lb channel)
// Note: the id is added to channels at graphParser.parse, variable "channel" is
// channel name with.
if (Object.keys(inSockts['lb']).length>0)
{
    //var chIndex=0;
    for (var channel in inSockts['lb'])
    {
        var chArgs = argumentsParser.convertToChannelArguments(inSockts['lb'][channel],
        outSockts['lb'][channel]);
        
        docker.run('channel/lb',[],process.stdout,{
            'Hostname':channel,
            'name':channel,
            'Cmd':['node', 'router.js', chArgs] ,
            'ExposedPorts': { 
                '5000/tcp': {} 
                },
             'HostConfig':{
                 'NetworkMode':'deployernet'+'-'+id
             }
            },function(err){
                if(err) console.log(err);
            });       
    }
}
// Same with component arguments

// Deploy each container when its image is builded
myEmitter.on('buildFinish', function(comp){
    var cArgs = argumentsParser.convertToComponentArguments(inSockts[comp],
        outSockts[comp]);
    for (var i=0; i<dJson.cardinality[comp]; i++)
    {
        // TODO: Try to delete stdout. Now stdout is merging the stdout
        // of each container. 
        
        docker.run('component/'+comp,[],process.stdout,{
            'Hostname':comp+'-'+i+'-'+id,
            'name':comp+'-'+i+'-'+id,
            'Cmd':['node','runtime.js',cArgs],
            'ExposedPorts': { 
                '5000/tcp': {} 
                },
             'HostConfig':{
                 'NetworkMode':'deployernet'+'-'+id
             }
            },
        function(err){
                if(err) console.log(err)
                else console.log('Container: '+comp+'-'+i+' ... is Running \n')
        })
    }
})
    