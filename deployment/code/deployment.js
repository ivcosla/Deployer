var dJson = require("../package.json");
var sJson = require("../"+dJson.service_path+"package.json");
var Docker = require("dockerode");
var docker = new Docker();
var exec = require('child_process').execSync; 

// For tailoring the dockerfiles of each component
var Dfm = require("./dockerFileMaker.js");
var dfm = new Dfm();

// loops througth each component and makes a Dockerfile
// at the top of its directory
var components = sJson.components;
for (var comp in components){
    dfm.composeDockerfile(components[comp],sJson)  
    // In order to build images from the Api, the directory
    // containing the Dockerfile and code must be compressed
    // as tar. Dockerfile must be in root of the tar.
    
    // Using system call instead of nodejs library.
    exec('tar -C '+components[comp]+' -cvf ../'+comp+'.tar'+' .')

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
                }
            })
    })(comp);

}