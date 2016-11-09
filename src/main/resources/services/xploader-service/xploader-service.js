var portalLib = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var xpLoaderLib = require('/lib/xploader');

function parseFormat() {
    var fields = [];
    var i = 0;

    var fieldNameItem = portalLib.getMultipartText("field-name-" + i);

    while (fieldNameItem) {
        var fieldAlias = portalLib.getMultipartText("field-alias-" + i);
        var fieldSkip = portalLib.getMultipartText("field-skip-" + i);
        var isNodeNameElement = portalLib.getMultipartText("field-nodeNameElement-" + i);
        var valueType = portalLib.getMultipartText("field-valueType-" + i);
        var field = {};
        field.name = fieldNameItem;
        field.alias = fieldAlias;
        field.skip = fieldSkip == 'on';
        field.nodeNameElement = isNodeNameElement == 'on';
        field.valueType = valueType;
        fields.push(field);
        i++;
        fieldNameItem = portalLib.getMultipartText("field-name-" + i);
    }

    return fields;
}

function runPublish() {
    xpLoaderLib.publish();

    var model = {
        published: "ok"
    }

    return {
        contentType: 'text/plain',
        body: model
    }
}
exports.post = function (req) {

    var redirectUrl = "http://localhost:8080/admin/tool/com.enonic.app.xploader/xploader";

    var publishOnly = portalLib.getMultipartText("publishOnly");

    if (publishOnly == 'on') {
        return runPublish();
    }

    var byteSource = portalLib.getMultipartStream("file");
    var file = portalLib.getMultipartItem("file");
    var format = parseFormat();

    var result = xpLoaderLib.load(byteSource, format, "content");

    log.info("Result: %s", result);

    log.info("Redirect: %s", redirectUrl);

    return {
        redirect: redirectUrl
    };
};
