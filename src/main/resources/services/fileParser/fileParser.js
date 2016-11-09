var portalLib = require('/lib/xp/portal');
var xpLoaderLib = require('/lib/xploader');

exports.post = function (req) {

    var byteSource = portalLib.getMultipartStream("file-0");
    var file = portalLib.getMultipartItem("file-0");

    var result = xpLoaderLib.getFormat(byteSource, file.fileName);

    var model = {
        result: result
    };

    return {
        contentType: 'application/json',
        body: model
    }

};
