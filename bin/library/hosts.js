var os = require("os");
var platform = os.platform();
var fs = require("fs-extra");

var HostsMaps = {
    "darwin" : "/etc/hosts",
    "win32" : "c:/Windows/System32/drivers/etc/hosts"
};

function get ( callback ){
    //��ȡhosts�ļ�
    fs.readFile( HostsMaps[ platform ], 'utf-8', function (err, data) {
        if( err ){
            return callback( err );
        }

        var fl = [];
        //��ȡconfig/hosts�µĸ����ļ�
        fs.readdir("config/hosts", function (err, arr){
            if( err ){
                return callback( err );
            }
            //��ȡ�����ļ�
            arr.forEach(function ( el ){
                var $fs = fs.readJsonSync("config/hosts/" + el);
                $fs = JSON.parse(JSON.stringify($fs));
                //���������ļ���(��ȻҪɾ��.json��5���ַ�),
                //����Ϊjson�������
                fl.push({
                    name : el.replace(/\.json/, ""),
                    content : $fs.content
                });
            });

            var maps = {};

            maps.defaults = {
                name : "Default Hosts",
                content : data.toString()
            };

            maps.others = fl;

            return callback( null, maps );
        });
    });
}

module.exports = {
    get : get
};