module.exports = function(RED){
    "use strict";

    function YoutubeUpload(n){
        RED.nodes.createNode(this, n);
        this.google = RED.nodes.getNode(n.google);
        this.privacyStatus = n.privacyStatus;
        this.mediapath = n.mediapath;
        this.mediapathType = n.mediapathType;
        var Youtube = require('youtube-api');
        var Fs = require('fs');
        var Path = require('path');
        var Progress = require('progress-stream');
        var progressStream = Progress({time:500});

        this.status({});
        var node = this;

        this.on('input', function(msg){
            //TODO text in youtube.json
            node.status({fill:"blue", shape:"ring", text:"uploading"});

            Youtube.authenticate({
                type: "oauth"
                , token: node.google.credentials.accessToken
            });



            progressStream.on('progress', function(progress) {
                node.status({fill:"blue", shape:"ring", text:progress.percentage + "%"});
            });

            var videoPath = Path.resolve(RED.util.evaluateNodeProperty(node.mediapath, node.mediapathType, node, msg));
            var title_ = RED.util.evaluateNodeProperty(node.title, node.titleType, node, msg);
            var description_ = RED.util.evaluateNodeProperty(node.description, node.descriptionType, node, msg)

            var stat = Fs.statSync(videoPath);
            progressStream.setLength(stat.size);

            Youtube.videos.insert({
                resource: {
                    snippet: {
                        title: title_,
                        description: description_,
                    },

                    status: {
                        privacyStatus: node.privacyStatus
                    }
                },

                part: "snippet,status",

                // Create the readable stream to upload the video
                media: {
                    body: Fs.createReadStream(videoPath).pipe(progressStream)
                }
            }, function(err, data){
                if(err){
                    node.status({fill:"red", shape:"dot", text:"Error " + err});
                    node.error(err);
                }else{
                    node.status({});
                    msg.payload = data;
                    node.send(msg);
                }
            })
        });
    }
    RED.nodes.registerType("youtube-upload", YoutubeUpload);
}
