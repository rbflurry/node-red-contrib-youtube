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

            var ytdl = Ytdl(url_, { filter: function(format) { return format.container === 'mp4'; } });

            ytdl.on('response', function(response) {
                console.log(response);
                progressStream.setLength( response["Content-Length"] );
            });
            ytdl.on('finish', function(){
                node.status({fill:"blue", shape:"dot", text:"Done"});
                node.send(msg);
            });
            ytdl.pipe(progressStream).pipe(Fs.createWriteStream(path_));
        });
    }
    RED.nodes.registerType("youtube-download", YoutubeDownload);
}
