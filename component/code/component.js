var fs=require('fs');
var zmq = require('zmq');
var pack_json=fs.readFileSync('../package.json','utf8');
var component = JSON.parse(pack_json);

//fs.writeFile("hola.txt",'hola')
//var serviceEndPoint = process.argv[1]

setTimeout(function(){

    console.log("Mi stdout");

    endpoints.i1.bind(function(err){
        if(err) console.log(err);
        console.log('conectado')
        endpoints.i1.socket.on("message", function(msg){
            console.log(msg.toString());
        })
    });



    endpoints.o1.connect(function(err){
        console.log(err);
    })

    setInterval(function(){
        endpoints.o1.socket.send("Soy el componente")
        //console.log("envio")
    }, 5000)

},30000);