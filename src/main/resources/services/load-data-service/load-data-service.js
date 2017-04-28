var portalLib = require('/lib/xp/portal');
var xpLoaderLib = require('/lib/xploader');
var nodeLib = require('/lib/xp/node');
var ioLib = require('/lib/xp/io');
var contextLib = require('/lib/xp/context');
var proj4j = require('/lib/proj4j');
var taskLib = require('/lib/xp/task');
var valueLib = require('/lib/xp/value');

var FORMAT_FIELD_NAME = "field-name-";
var FORMAT_FIELD_ALIAS = "field-alias-";
var FORMAT_FIELD_SKIP = "field-skip-";
var FORMAT_FIELD_NODE_NAME = "field-nodeName-";
var FORMAT_FIELD_VALUE_TYPE = "value-type-";
var FORMAT_SIBLING_SELECTOR = "sibling-selector-";

var GSC_FORMAT = null;
var WSG_UTM = 'WGS84-UTM';

exports.post = function (req) {

    var byteSource = portalLib.getMultipartStream("file");
    var file = portalLib.getMultipartItem("file");
    var format = parseFormat(req.params);
    parseGCSFormat(req.params);
    var repo = "not set";

    if (req.params.selectRepoId) {
        repo = req.params.selectRepoId;
    }

    var taskId = loadData(repo, byteSource, format);

    return {
        contentType: 'application/json',
        body: {
            taskId: taskId
        }
    }
};

var loadData = function (repo, byteSource, format) {

    // Needs to preserve byteSource to avoid the source to be done when request returns
    var preservedSource = xpLoaderLib.preserveByteSource(byteSource);

    return taskLib.submit({
        description: 'me.myklebust.app.xploader:loadData',
        task: function () {
            runInContext(repo, "master", function () {
                doLoadData(repo, "master", preservedSource, format);
            });
        }
    });
};

var runInContext = function (repo, branch, callback) {
    return contextLib.run({
        branch: branch,
        repository: repo
    }, callback);
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

var doLoadData = function (repo, branch, byteSource, format) {

    var repo = nodeLib.connect({
        repoId: repo,
        branch: branch
    });

    var first = true;
    var processed = 0;
    var skipped = 0;
    var created = 0;
    var failed = 0;

    var loadStart = new Date().getTime();

    var currentSpeed = "0/s";

    var strDelimiter = ",";

    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );


    ioLib.processLines(byteSource, function (line) {

        if (!first) {
            processed++;
            var data = processLine(line, objPattern, format);
            if (data) {
                try {
                    repo.create(data);
                    created++;
                } catch (e) {
                    log.error("Could not create entry %s, %s", data, e);
                    failed++;
                }
            } else {
                skipped++;
            }
        } else {
            log.info("Processing file, starting");
            taskLib.progress({
                info: 'Starting'
            });
            first = false;
        }

        if (processed % 500) {
            currentSpeed = (processed / ((new Date().getTime() - loadStart) / 1000)) + "/s";
        }

        taskLib.progress({
            info: 'Processing item ' + (processed + 1) + " (" + currentSpeed + ")" + ", created: " + created + ", failed: " + failed +
                  ", skipped: " + skipped,
            current: processed
        });
    });

    var loadEnd = new Date().getTime() - loadStart;

    log.info("Processed [%s] nodes in [%s] ms", processed, loadEnd);
};

var processLine = function (line, objPattern, format) {
    var fields = CSVToArray(line, objPattern);
    return extractData(fields, format);
};

var CSVToArray = function (strData, objPattern) {
    var arrData = [];
    var arrMatches = null;

    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {
        var strMatchedValue;
        if (arrMatches[2]) {
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"),
                "\""
            );
        } else {
            strMatchedValue = arrMatches[3];
        }
        arrData[arrData.length] = strMatchedValue;
    }
    return arrData;
};


var extractData = function (fields, format) {
    var data = {};
    var name = "";

    if (fields.length != format.length) {
        log.error("Could not parse this row: %s, has %s instead of %s - skipping", fields, fields.length, format.length);
        debugParseError(fields, format);
        return;
    }

    for (var i = 0; i < fields.length; i++) {
        var formatEntry = format[i];
        var fieldValue = fields[i];

        if (formatEntry.skip) {
            continue;
        }

        var fieldName = formatEntry.alias;
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


var debugParseError = function (fields, format) {

    for (var i = 0; i < Math.max(fields.length, format.length); i++) {

        var formatStr = format[i] ? "Format: " + format[i].name + "[" + format[i].valueType + "]" : "no format";
        var fieldValue = fields[i] ? " - fieldValue: " + fields[i] : "no value";
        log.info("------------------------------");
        log.info(formatStr + " - " + fieldValue);
    }
};

var sanitizeValue = function (type, fieldValue) {
    return fieldValue ? cleanStringValue(fieldValue) : null;
};

var createValue = function (type, fieldName, value, joinValue) {
    if (type === 'instant') {
        return "valueLib.instant('" + value + "')";
    }
    else if (type == 'reference') {
        return "valueLib.reference('" + value + "')";
    }
    else if (type == 'number') {
        return returnAsNumber(value);
    }
    else if (type == 'geoPointLat') {
        return createGeoPointValue(value, joinValue);
    }
    else if (type == 'geoPointLon') {
        return createGeoPointValue(joinValue, value);
    }

    return value;
};

var returnAsNumber = function (value) {
    return parseFloat(value);
};

var createGeoPointValue = function (lat, lon) {

    if (GSC_FORMAT.type === WSG_UTM) {

        var latZone = GSC_FORMAT.utm.latitudeZone;
        var lonZone = GSC_FORMAT.utm.longitudeZone;
        var unit = GSC_FORMAT.utm.unit;

        var latLonAsString = proj4j.fromUTM(lonZone, latZone, lon, lat, unit);

        return valueLib.geoPointString(latLonAsString);
    }

    return valueLib.geoPoint(lat, lon);
};

var cleanStringValue = function (value) {

    value = value.replace(/\W]/g, '');

    if (value.startsWith("\"")) {
        value = value.slice(1);
    }

    if (value.endsWith("\"")) {
        value = value.slice(0, -1);
    }

    return value;
};
