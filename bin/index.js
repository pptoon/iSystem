var fs = require("fs-extra");
var http = require("http");
var url = require("url");
var socket = require("socket.io");

var serverListen = 3005;

var hosts = require("./library/hosts");

var server = http.createServer( handle );
var io = socket( server );

server.listen( serverListen );

io.on("connection", function ( sockets ){

    sockets.on("change-hosts", function (){
        console.log("hello");
    });

    sockets.on("change-path", function (){

    });

    hosts.get(function (err, data){
        sockets.emit("get-hosts", {
            data : data
        })
    })
});

var suffixMaps = {
    "css" : "text/css",
    "js" : "text/javascript",
    "json" : "application/json",
    "html" : "text/html"
};

function handle ( request, response ){
    //解析请求url
    var pathname = url.parse(request.url).pathname;

    pathname = pathname == "/" ? "index.html" : pathname;

    //拿到当前绝对路径
    var realPath = process.cwd() + "/ui/" + pathname;

    fs.exists(realPath, function (exists) {
        if (!exists) {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.end();
        } else {
            fs.readFile(realPath, "binary", function(err, file) {
                if (err) {
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.end(err);
                } else {
                    var r = realPath.split(".");
                    var suffix = suffixMaps[r[r.length - 1]];
                    response.writeHead(200, {"Content-Type" : suffix});
                    response.write(file, "binary");
                    response.end();
                }
            });
        }
    });
}


