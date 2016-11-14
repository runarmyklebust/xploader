var portalLib = require('/lib/xp/portal');
var xpLoaderLib = require('/lib/xploader');
var nodeLib = require('/lib/xp/node');
var ioLib = require('/lib/xp/io');
var contextLib = require('/lib/xp/context');
var proj4j = require('/lib/proj4j');

var FORMAT_FIELD_NAME = "field-name-";
var FORMAT_FIELD_ALIAS = "field-alias-";
var FORMAT_FIELD_SKIP = "field-skip-";
var FORMAT_FIELD_NODE_NAME = "field-nodeName-";
var FORMAT_FIELD_VALUE_TYPE = "value-type-";
var FORMAT_SIBLING_SELECTOR = "sibling-selector-";

var GSC_FORMAT = null;
var WSG_UTM = 'WGS84-UTM';

exports.post = function (req) {

    log.info("PARAMS: %s", req.params);

    var redirectUrl = "http://localhost:8080/admin/tool/com.enonic.app.xploader/xploader";

    var byteSource = portalLib.getMultipartStream("file");
    var file = portalLib.getMultipartItem("file");
    var format = parseFormat(req.params);
    parseGCSFormat(req.params);
    var repo = "not set";

    if (req.params.selectRepoId) {
        repo = req.params.selectRepoId;
    }

    doLoadData(repo, byteSource, format);

    return {
        redirect: redirectUrl
    };
};


function parseFormat(params) {
    var fields = [];
    var i = 0;

    var fieldNameItem = params[FORMAT_FIELD_NAME + i];

    while (fieldNameItem) {
        var fieldAlias = params[FORMAT_FIELD_ALIAS + i];
        var fieldSkip = params[FORMAT_FIELD_SKIP + i];
        var isNodeNameElement = params[FORMAT_FIELD_NODE_NAME + i];
        var valueType = params[FORMAT_FIELD_VALUE_TYPE + i];
        var siblingId = params[FORMAT_SIBLING_SELECTOR + i];
        var field = {};
        field.name = fieldNameItem;
        field.alias = fieldAlias;
        field.skip = fieldSkip == 'on';
        field.nodeNameElement = isNodeNameElement == 'on';
        field.valueType = valueType;
        if (siblingId) {
            field.siblingId = siblingId;
        }
        fields.push(field);
        i++;
        fieldNameItem = params["field-name-" + i];
    }

    return fields;
}

var parseGCSFormat = function (params) {

    GSC_FORMAT = {};

    if (!params.gcsSelector) {
        GSC_FORMAT = null;
        return;
    }

    GSC_FORMAT = {
        type: params.gcsSelector
    };

    if (GSC_FORMAT.type === WSG_UTM) {
        GSC_FORMAT.utm = {};
        GSC_FORMAT.utm.unit = params.wsg84UtmUnit;
        GSC_FORMAT.utm.latitudeZone = params.wsg84UtmLatitudeZone
        GSC_FORMAT.utm.longitudeZone = params.wsg84UtmLongitudeZone;
    }

};

var doLoadData = function (repo, byteSource, format) {
    var first = true;
    var processed = 0;

    ioLib.processLines(byteSource, function (line) {
        if (!first) {
            var data = processLine(line, format);
            runInContext(repo, 'master', function () {
                nodeLib.create(data);
            });
            log.info("Processed [" + ++processed + "]");
        } else {
            first = false;
        }
    });
};

var processLine = function (line, format) {
    var fields = line.split(",");
    return extractData(fields, format);
};

var extractData = function (fields, format) {
    var data = {};
    var name = "";

    if (fields.length != format.length) {
        log.error("Could not parse this row: %s, skipping", fields);
        return;
    }

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

        var joinValue = null;

        if (formatEntry.siblingId) {
            joinValue = fields[formatEntry.siblingId];
        }

        data[fieldName] = createValue(type, fieldName, value, joinValue);
    }

    if (name.length > 0) {
        data._name = name;
    }

    return data;
};

var runInContext = function (repo, branch, callback) {
    return contextLib.run({
        branch: branch,
        repository: repo
    }, callback);
};

var sanitizeValue = function (type, fieldValue) {
    return cleanStringValue(fieldValue);
};

var createValue = function (type, fieldName, value, joinValue) {
    if (type === 'instant') {
        return "nodeLib.instant('" + value + "')";
    }
    else if (type == 'reference') {
        return "nodeLib.reference('" + value + "')";
    }
    else if (type == 'geoPointLat') {
        return createGeoPointValue(value, joinValue);
    }
    else if (type == 'geoPointLon') {
        return createGeoPointValue(joinValue, value);
    }

    return value;
};

var createGeoPointValue = function (lat, lon) {

    log.info("GeoPointValue: %s", JSON.stringify(GSC_FORMAT));

    return nodeLib.geoPoint(lat, lon);
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
