var xpLoaderLib = require('/lib/xploader');

exports.get = function (req) {

    var model = {
        status: xpLoaderLib.status()
    };

    return {
        contentType: 'application/json',
        body: model
    }
};