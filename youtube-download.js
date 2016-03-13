module.exports = function(RED){
    "use strict";

    function YoutubeDownload(n){
        RED.nodes.createNode(this, n);
        this.url = n.url;
        this.urlType = n.urlType;
        this.path = n.path;
        this.pathType = n.pathType;
        var Ytdl = require('ytdl-core');
        var Fs = require('fs');
        var Progress = require('progress-stream');
        var progressStream = Progress({time:500});

        this.status({});
        var node = this;

        this.on('input', function(msg){
            var path_ = RED.util.evaluateNodeProperty(node.path, node.pathType, node, msg);
            var url_ = RED.util.evaluateNodeProperty(node.url, node.urlType, node, msg);


            progressStream.on('progress', function(progress) {
                node.status({fill:"blue", shape:"ring", text:progress.percentage + "%"});
            });

            Ytdl(url_, { filter: function(format) { return format.container === 'mp4'; } })
                .pipe(progressStream)
                .pipe(Fs.createWriteStream(path_))
                .on('finish', function(){
                    node.status({fill:"blue", shape:"dot", text:"Done"});
                    node.send(msg);
                })
        });
    }
    RED.nodes.registerType("youtube-download", YoutubeDownload);
}
