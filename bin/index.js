var fs = require("fs-extra");
var http = require("http");
var url = require("url");
var path = require("path");
var socket = require("socket.io");

var serverListen = 3005;

var hosts = require("./library/hosts");

var server = http.createServer( handle );
var io = socket( server );

server.listen( serverListen );

var hosts_path = "config/hosts/";

io.on("connection", function ( sockets ){

    sockets.on("change-hosts", function ( data ){
        //创建新分组
        if( data.newGroup == true ){
            fs.writeJson( hosts_normalize("new_hosts_" + new Date().getTime()), {
                content : ""
            }, function (){
                sockets.emit("change-ok");
            });
        }
        //分组名修改
        else if( data.oldName && data.newName ){

            var olds = hosts_normalize(data.oldName);
            var news = hosts_normalize(data.newName);

            fs.copy( olds, news, function (err){
                if( err ) return sockets.emit("system-error", err);
                fs.remove( olds, function ( err ){
                    if( err ) return sockets.emit("system-error", err);
                    sockets.emit("change-ok");
                });
            })
        }
        //删除分组
        else if( data.$delete && data.name ){
            fs.remove( hosts_normalize(data.name), function ( err ){
                if( err ) return sockets.emit("system-error", err);
                refresh_hosts(function (){
                    sockets.emit("change-ok");
                });
            })
        }
        //修改分组内容
        else if ( data.content && data.name ){
            fs.writeJson( hosts_normalize(data.name), {
                content : data.content
            }, function (){
                refresh_hosts(function (){
                    sockets.emit("change-ok");
                });
            })
        }
    });

    sockets.on("get-hosts", function (){
        hosts.get(function (err, data){
            sockets.emit("get-hosts", data);
        })
    });

    function refresh_hosts ( callback ){
        hosts.get(function ( err, data ){
            var r = "";
            data.others.forEach(function ( el, i ){
                r += el.content;
            });
            // r 就是分组内的所有hosts信息
            data.defaults.content += r;
            hosts.set( data.defaults.content, function (err){
                if( err ) return sockets.emit("system-error", err);
                sockets.emit("change-ok");
                callback();
            });
        });
    }
});

var suffixMaps = {
    "css" : "text/css",
    "js" : "text/javascript",
    "json" : "application/json",
    "html" : "text/html"
};

function hosts_normalize ( name ){
    return path.normalize( hosts_path + name + ".json" );
}

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


