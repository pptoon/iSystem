#!/usr/bin/env node

var fs = require("fs-extra");
var program = require('commander');
var isystem = require("./index");
var version = "0.3.2";
var serverListen = 3005;

program
    .version( version )
    .option('-p, --port <port>', 'set port', function ( port ){
        serverListen = port;
    })
    .option('-c --clear', 'clear config files', function (){
        fs.remove("config/", function (err){
            if( err ) return console.log(err);
            console.log("clear success!");
        });
    });

program.parse( process.argv );

isystem.cli( serverListen );

