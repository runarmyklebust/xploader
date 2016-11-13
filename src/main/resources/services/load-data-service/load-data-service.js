var portalLib = require('/lib/xp/portal');
var xpLoaderLib = require('/lib/xploader');
var nodeLib = require('/lib/xp/node');
var ioLib = require('/lib/xp/io');

function parseFormat(params) {
    var fields = [];
    var i = 0;

    var fieldNameItem = params["field-name-" + i];

    while (fieldNameItem) {
        var fieldAlias = params["field-alias-" + i];
        var fieldSkip = params["field-skip-" + i];
        var isNodeNameElement = params["field-nodeNameElement-" + i];
        var valueType = params["value-type-" + i];
        var field = {};
        field.name = fieldNameItem;
        field.alias = fieldAlias;
        field.skip = fieldSkip == 'on';
        field.nodeNameElement = isNodeNameElement == 'on';
        field.valueType = valueType;
        fields.push(field);

        log.info("Fields: %s", JSON.stringify(fields));

        i++;
        fieldNameItem = params["field-name-" + i];
    }

    return fields;
}

function runPublish() {
    xpLoaderLib.publish();

    var model = {
        published: "ok"
    };

    return {
        contentType: 'text/plain',
        body: model
    }
}
exports.post = function (req) {

    var redirectUrl = "http://localhost:8080/admin/tool/com.enonic.app.xploader/xploader";

    var byteSource = portalLib.getMultipartStream("file");
    var file = portalLib.getMultipartItem("file");
    var format = parseFormat(req.params);

    var repo = "not set";

    if (req.params.selectRepoId) {
        repo = req.params.selectRepoId;
    }

    doLoadData(byteSource, file, format);
//    var result = xpLoaderLib.load(byteSource, format, "content");

    //  log.info("Result: %s", result);

    //log.info("Redirect: %s", redirectUrl);

    return {
        redirect: redirectUrl
    };
};


var doLoadData = function (byteSource, file, format) {
    ioLib.processLines(byteSource, function (line) {
        processLine(line, format);
    });
};

var processLine = function (line, format) {

    var fields = line.split(",");
    var data = extractData(fields, format);

    log.info("DATA: %s", JSON.stringify(data));
};

var extractData = function (fields, format) {
    var data = {};

    var name = "";

    for (var i = 0; i < fields.length; i++) {
        var formatEntry = format[i];
        var fieldValue = fields[i];

        if (formatEntry.skip) {
            continue;
        }

        var fieldName = formatEntry.name;
        var type = formatEntry.valueType;
        var value = sanitizeValue(type, fieldValue);

        if (formatEntry.nodeNameElement) {
            name += value;
        }

        data[fieldName] = createValue(type, fieldName, value);
    }

    if (name.length > 0) {
        data._name = name;
    }

    log.info("DATA: %s", data);

    return data;
};

var sanitizeValue = function (type, fieldValue) {
    return cleanStringValue(fieldValue);
};

var createValue = function (type, fieldName, value) {
    if (type === 'instant') {
        return 'nodeLib.instant("' + value + '")';
    } else if (type == 'reference') {
        return 'nodeLib.reference("' + value + '")';
    } else if (type == 'geoPoint') {
        return 'nodeLib.geoPoint("' + value + '"';
    }
    return value;
};

var cleanStringValue = function (value) {

    if (value.startsWith("\"")) {
        value = value.slice(1);
    }

    if (value.endsWith("\"")) {
        value = value.slice(0, -1);
    }

    return value;
};

var createName = function () {


};
