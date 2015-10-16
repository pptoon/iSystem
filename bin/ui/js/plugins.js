var socket = io.connect(location.host);

function getParameter ( e ){
    var t = new RegExp("(^|&)" + e + "=([^&]*)(&|$)", "i"),
        n = location.search.substr(1).match(t);
    return n != null ? decodeURIComponent(n[2]) : null
}

function paramsToJSON (){
    var $u = location.search.slice(1),
        r = {};
    if( !!$u ){
        $u = $u.split("&");
    } else {
        return r;
    }

    $u.forEach(function (el){
        var $n = el.split("=");
        r[$n[0]] = $n[1];
    });
    return r;
}

var editor = CodeMirror.fromTextArea(document.querySelector(".pluginCode"), {
    value : "function (){}",
    lineNumbers: true,
    mode : "javascript",
    lineWrapping: true,
    styleActiveLine: true
});

editor.setOption("theme", "mbo");

var codeReusultEditor = CodeMirror.fromTextArea(document.querySelector(".pluginResultCode"),{
    lineNumbers: true,
    mode : "javascript",
    lineWrapping: true,
    styleActiveLine: true,
    readOnly : true
});

codeReusultEditor.setOption("theme", "mbo");

var pluginName = $(".pluginName");

//修改
pluginName.val(get$name());

//set title in location.hash
pluginName.on("keyup", function (){
    location.hash = "#" + pluginName.val();
});

//
editor.setValue( getStore() );

editor.on("change", function (e){
    setStore();
});

//当运行结果返回
socket.on("code-run-result", function ( data ){
	codeReusultEditor.setValue( data ? data : "undefined" );
});

var $complileText = "Compile...";

//运行代码
$(".code-run").on("click", function (){
    codeReusultEditor.setValue($complileText);
    socket.emit("code-run", getStore());
    setStore();
});

//添加插件
$(".add-plugins").on("click", function (){

    var val = codeReusultEditor.getValue();

    if( val.indexOf($complileText) > -1 || val.length < 1 ) return;

    socket.emit("change-hosts", {
        newGroup : true,
        content : val,
        name : get$name()
    });

    location.href = "/";
});

function setStore (){
    var v = editor.getValue(),
        s = get$name();
    v && v.length > 0 
    && s && s.length > 0 
    && localStorage.setItem( s, v );
}

function getStore (){
    return !!get$name() ? ( localStorage.getItem(get$name()) || "") : "";
}

function get$name(){
    return location.hash.slice(1);
}