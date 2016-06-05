
var fs = require('fs');

var imageid = 10;
module.exports = function (RED) {

    
    function DashboardOutNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function(msg) {
            //if (!msg.payload || !msg.facebook) {
            if (!msg.payload) {
                node.error('Missing property!');
                return;
            }

            console.log("using http root dir" + RED.settings.imagedir);
            
            if (msg.payload.image) { 

                // update image index filename

                var indexfile = RED.settings.imagedir + '/index.json';
                var indexjson;

                
                
                if (fs.existsSync(indexfile)) {

                    indexjson = JSON.parse(fs.readFileSync(indexfile, 'utf8'));

                } else { 

                    indexjson = {files:[]};
                }

                indexjson.files.push({"filename":+imageid+".jpg","title":"output","description":"Joey's picture", "url":"/images/"+imageid+".jpg"});                
                fs.writeFileSync(indexfile, JSON.stringify(indexjson));

                // persist image

                var filename = RED.settings.imagedir+'/'+imageid+'.jpg';
                var image = new Buffer(msg.payload.image, 'base64');
                fs.writeFileSync(filename, image);

                imageid++;


            }

            
        });
    }

    RED.nodes.registerType('dashboard out', DashboardOutNode);
}
