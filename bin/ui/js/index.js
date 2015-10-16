var socket = io.connect(location.host);
var defaultsHostsTpl = $("#hosts-temp").html();
var othersHostsTpl = $("#hosts-group-temp").html();
var hostsStage = $(".hosts-stage");
var updateLock = true;

//hosts相关
socket.emit("get-hosts");

socket.on("get-hosts", function ( data ){

    //the default hosts
    var defaults = data.defaults;

    $(".default-hosts-group").html(_.template(defaultsHostsTpl)({
        name : defaults.name,
        content : defaults.content.split("\n")
    }));

    //others hosts group
    var others = data.others;
    $(".hosts-groups").html(_.template(othersHostsTpl)({
        others : others
    }));

    updateLock = true;
});

//add more hosts group
$(".add-more-hosts").on("click", function (){
    socket.emit("change-hosts", {
        newGroup : true
    });
});

var oldName = null;
var newName = null;

hostsStage.on("focus", ".title", function (){
    oldName = $(this).text();
});

hostsStage.on("blur", ".title", function (e){
    newName = $(this).text();

    if( newName !== oldName && !!newName ){
        socket.emit("change-hosts", {
            newName : newName,
            oldName : oldName
        })
    }

    newName = null;
    oldName = null;
});

//delete hosts group
hostsStage.on("click", ".delete", function (e){
    var theName = $(e.currentTarget).attr("data-name");
    socket.emit("change-hosts", {
        $delete : true,
        name : theName
    })
});

var ipRe = /((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]))/g;

hostsStage.on("blur", ".hosts-list", function (e){
    var target = $(e.currentTarget);
    if( target.hasClass("noModify") ) return;
    var theName = $(e.currentTarget).attr("data-name");
    var theContent = getHostsText($(this).text());
    socket.emit("change-hosts", {
        name : theName,
        content : theContent
    })
});

//禁用 / 启用
hostsStage.on("click", ".banOrPick", function (e){
    var target = $(e.currentTarget);
    var theName = target.attr("data-name");
    var $ban = target.attr("data-ban");
    var $b = $ban == 0 ? 1 : 0;
    target.attr("data-ban", $b);
    socket.emit("change-hosts", {
        name : theName,
        ban : $b
    })
});

hostsStage.on("click", ".update", function (e){

    if( !updateLock ) return showConfirm("更新中, 请稍后!");

    updateLock = false;

    var target = $(e.currentTarget);
    var theName = target.attr("data-name");
    var theScript = localStorage.getItem(theName);

    target.text("更新中").attr("disabled", "disabled");

    $("." + theName + "_container").html('<div class="xless-loading5"><div></div><div></div><div></div></div>');

    //更新hosts
    socket.emit("code-run", theScript);

    //返回更新后的hosts
    socket.on("code-run-result", function ( data ){
        socket.emit("change-hosts", {
            name : theName,
            content : data
        });
        socket.emit("get-hosts");
    });
});

function getHostsText ( text ){
    return text.replace(ipRe, "\n$1")
        .replace(/\s{2,}/g, "\n");
}