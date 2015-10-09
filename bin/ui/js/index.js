var socket = io.connect("http://127.0.0.1:3005");
var defaultsHostsTpl = $("#hosts-temp").html();
var othersHostsTpl = $("#hosts-group-temp").html();
var hostsStage = $(".hosts-stage");

//���³ɹ�֮��������ȡһ�����µ�hosts/path,�����ᴥ��node�˵�emit:get-hosts,
//ǰ�˻�ͬ���������µ�hosts/path
socket.on("change-ok", function (data){
    socket.emit("get-hosts");
});

socket.on("get-hosts", function ( data ){

    //Ĭ�ϵ�hosts
    var defaults = data.defaults;
    $(".default-hosts-group").html(_.template(defaultsHostsTpl)({
        name : defaults.name,
        content : defaults.content.split("\n")
    }));

    //�����hosts
    var others = data.others;
    $(".hosts-groups").html(_.template(othersHostsTpl)({
        others : others
    }));
});

//����µ�hosts����
$(".add-more-hosts").on("click", function (){
    socket.emit("change-hosts", {
        newGroup : true
    });
});

var oldName = null;
var newName = null;

hostsStage.on("focus", ".title", function (){
    oldName = $(this).html();
});

hostsStage.on("blur", ".title", function (){
    newName = $(this).html();
    //���������޸�
    if( newName !== oldName ){
        socket.emit("change-hosts", {
            newName : newName,
            oldName : oldName
        })
    }

    newName = null;
    oldName = null;
});

