var currentFieldData = null;

var FORMAT_FIELD_NAME = "field-name-";
var FORMAT_FIELD_ALIAS = "field-alias-";
var FORMAT_FIELD_SKIP = "field-skip-";
var FORMAT_FIELD_VALUE_TYPE = "value-type-";
var FORMAT_FIELD_SET = "field-set-";
var FORMAT_NODE_NAME = "field-nodeName-";


var VALUE_TYPE_GEO_POINT_LAT = "geoPointLat";
var VALUE_TYPE_GEO_POINT_LON = 'geoPointLon';

var SIBLING_SELECTOR_TD = 'sibling-data-td-';
var SIBLING_SELECTOR = "sibling-selector-";

var GCS_SELECTOR_DIV = "#gcsSelectorDiv";
var GCS_SELECT = '#gcsSelector';
var WGS84_DEG_SELECTOR = "#WGS84-deg";
var WGS84_UTM_SELECTOR = "#WGS84-UTM";


$(function () {

    $('#createRepoButton').click(function () {
        createRepo();
    });

    $('#deleteRepoButton').click(function () {
        deleteRepo();
    });

    initializeView();
});


var initializeView = function () {
    $('#status').hide();
    $('#messageBox').hide();
    $(GCS_SELECTOR_DIV).hide();
    $(WGS84_DEG_SELECTOR).hide();
    $(WGS84_UTM_SELECTOR).hide();
    toogleLoadManager();
};

var toogleLoadManager = function () {
    renderLoadManager();
    $('#loadManager').show();
    $('#repoManager').hide();
};

var toggleRepoManager = function () {
    renderRepoManager();
    $('#loadManager').hide();
    $('#repoManager').show();
};

var renderLoadManager = function () {
    getRepoList($('#selectRepoId'));
};

var renderRepoManager = function () {
    getRepoList($('#deleteRepoId'));
};

function createRepo() {
    var repoIdInput = $('#repoIdInput');
    var repoId = repoIdInput.val();

    var data = {
        repoId: repoId
    };

    jQuery.ajax({
        url: createRepoServiceUrl,
        cache: false,
        data: data,
        type: 'POST',
        success: function (result) {
            renderMessage(result);
            getRepoList($('#deleteRepoId'));
            repoIdInput.val('');
        }
    });
}

var handleValueTypeChange = function (element) {

    var id = element.id;
    var value = element.value;
    var index = id.match(/\d+$/)[0];

    if (value === VALUE_TYPE_GEO_POINT_LAT || value === VALUE_TYPE_GEO_POINT_LON) {
        renderGeoPointSibling(index, value);
        displayGCSConfig();
    }
};

var displayGCSConfig = function () {
    $(GCS_SELECT).material_select();
    $(GCS_SELECTOR_DIV).show();
};

var renderGeoPointSibling = function (index, value) {
    var siblingSelectorTd = $('#' + SIBLING_SELECTOR_TD + index);
    var siblingSelectId = SIBLING_SELECTOR + index;

    html = "";

    if (value === VALUE_TYPE_GEO_POINT_LAT) {
        siblingSelectorTd.html(renderSiblingsHtml(siblingSelectId, "Longitude field"));
    } else if (value === VALUE_TYPE_GEO_POINT_LON) {
        siblingSelectorTd.html(renderSiblingsHtml(siblingSelectId, "Latitude field"));
    }

    var select = $("#" + siblingSelectId);

    select.material_select();
};

var renderSiblingsHtml = function (siblingSelectId, type) {

    var html = "<div class='input-field'>";
    html += "<select id='" + siblingSelectId + "' name='" + siblingSelectId + "' onchange='disableSiblingField(this)'>";
    html += "<option value='disabled selected'>Choose</option>";


    var index = 0;
    currentFieldData.result.fields.forEach(function (field) {
        html += "<option value='" + index + "'>" + field.name + "</option>";
        index++;
    });
    html += "</select>";
    html += "<label for='" + siblingSelectId + "'> set matching " + type + "</label>";
    html += "</div>";

    return html;
};

var disableSiblingField = function (element) {
    var index = element.value;

    $("#" + FORMAT_FIELD_SKIP + index).prop('checked', true);
    $("#" + FORMAT_FIELD_ALIAS + index).prop('readonly', true);
    $("#" + FORMAT_NODE_NAME + index).prop('readonly', true);
    var siblingValueTypeSelect = $("#" + FORMAT_FIELD_VALUE_TYPE + index);
    siblingValueTypeSelect.val(VALUE_TYPE_GEO_POINT_LON, true);
    siblingValueTypeSelect.prop('selected', true);
    siblingValueTypeSelect.blur();
    siblingValueTypeSelect.material_select();
};

var showGCSSelector = function (element) {

    if (element.value === 'WGS84-deg') {
        $(WGS84_DEG_SELECTOR).show();
        $(WGS84_UTM_SELECTOR).hide();
    } else if (element.value === 'WGS84-UTM') {
        $(WGS84_UTM_SELECTOR).show();
        $(WGS84_DEG_SELECTOR).hide();
    }
};

function deleteRepo() {
    var repoId = $('#deleteRepoId').find(":selected").text();

    var data = {
        repoId: repoId
    };

    jQuery.ajax({
        url: deleteRepoServiceUrl,
        cache: false,
        data: data,
        type: 'POST',
        success: function (result) {
            renderMessage(result);
            getRepoList($('#deleteRepoId'));
        }
    });
}

var renderRepoList = function (result, renderer) {

    var html = "";
    result.repoList.forEach(function (entry) {
        html += "<option value='" + entry.id + "'>" + entry.id + "</option>";
    });

    console.log("Rendering element ", renderer);

    renderer.html(html);
    renderer.material_select();
};

var renderMessage = function (result) {

    var html = "";
    var messageBox = $('#messageBox');

    if (result.error) {
        html += result.error;
        messageBox.removeClass('message').addClass('error');
    } else if (result.message) {
        html += result.message;
        messageBox.removeClass('error').addClass('message');
    }

    $('#repoMessage').html(html);

    messageBox.show();

    setTimeout(function () {
        messageBox.fadeOut(1000, function () {
        });
    }, 1500);
};

var getRepoList = function (renderer) {
    jQuery.ajax({
        url: listRepoServiceUrl,
        cache: false,
        type: 'GET',
        success: function (result) {
            renderRepoList(result, renderer)
        }
    });
};

var getStatus = function () {
    jQuery.ajax({
        url: statusServiceUrl,
        cache: false,
        success: function (result) {
            console.log(result);
            var html = "";
            html += "<p>Status: " + result.status.jobStatus + "</p>";
            html += "<p>Processed: " + result.status.processed + "</p>";
            html += "<p>Speed: " + result.status.speed + "</p>";
            html += "<p>RunTime: " + result.status.runTime + "</p>";

            $('#status').html(html);
        }
    });
};

function initalizeValueSelectors(data) {
    var index = 0;
    data.result.fields.forEach(function (field) {
        var id = FORMAT_FIELD_VALUE_TYPE + index++;
        var select = $('#' + id);
        select.material_select();
    });

    // Keep this, as we need it for other stuff
    currentFieldData = data;
}

var fileUploaded = function () {

    var data = new FormData();

    jQuery.each(jQuery('#fileinput')[0].files, function (i, file) {
        data.append('file-' + i, file);
    });

    jQuery.ajax({
        url: parserServiceUrl,
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function (data) {
            renderFormat(data);
        }
    });

    var renderFormat = function (data) {
        var html = "";
        var index = 0;

        html += "<table class='highlight'>";
        html += "<th></th><th></th><th>Name in file</th><th>Fieldname</th><th>ValueType</th><th></th>";

        var first = true;
        data.result.fields.forEach(function (field) {
            html += renderFormatField(field, index++, first);
            first = false;
        });
        html += "</table>";
        $('#fieldsList').html(html);

        initalizeValueSelectors(data);
    };

    function renderFormatField(field, index) {
        var html = "";
        html += "<tr>";
        html += "<td>" + renderNameElementCheckbox(index) + "</td>";
        html += "<td>" + renderIgnoreCheckbox(index) + "</td>";
        html += "<td>" + renderFieldName(index, field) + "</td>";
        html += "<td>" + renderAlias(index, field) + "</td>";
        html += "<td>" + renderValueType(index) + "</td>";
        html += "<td id='" + SIBLING_SELECTOR_TD + index + "'></td>";
        html += "</tr>";
        return html;
    }

    function renderIgnoreCheckbox(index) {
        return renderCheckbox(FORMAT_FIELD_SKIP + index, "Skip");
    }

    function renderNameElementCheckbox(index) {

        return renderCheckbox(FORMAT_NODE_NAME + index, "name");
    }

    function renderFieldName(index, field) {

        var name = FORMAT_FIELD_NAME + index;
        var value = field.name;
        return renderTextField(name, value);
    }

    function renderAlias(index, field) {
        var name = FORMAT_FIELD_ALIAS + index;
        var value = field.name;
        return renderTextField(name, value);
    }

    function renderTextField(name, value) {
        var html = "<div class='input-field'>";
        html += "<input name='" + name + "' id='" + name + "' value='" + value + "' type='text' class='validate'>";
        html += "</div>";
        return html;
    }

    function renderValueType(index) {

        var id = FORMAT_FIELD_VALUE_TYPE + index;
        var html = "<div class='input-field'>";
        html += "<select name='" + id + "' id='" + id + "' onchange='handleValueTypeChange(this)'>";
        html += "<option value='string'>string</option>";
        html += "<option value='number'>number</option>";
        html += "<option value='instant'>instant</option>";
        html += "<option value='reference'>reference</option>";
        html += "<option value='localDateTime'>localDateTime</option>";
        html += "<option value='localDate'>localDate</option>";
        html += "<option value='localTime'>localTime</option>";
        html += "<option value='" + VALUE_TYPE_GEO_POINT_LAT + "'>geoPointLat</option>";
        html += "<option value='geoPointLon'>geoPointLon</option>";
        html += "<option value='geoPointString'>geoPointString</option>";
        html += "</select>";
        html += "</div>";
        return html;
    }

    function renderCheckbox(name, label) {
        var html = "<div class='input-field'>";
        html += "<input type='checkbox' class='filled-in' id='" + name + "' name='" + name + "'/>";
        html += "<label for='" + name + "'>" + label + "</label>";
        html += "</div>";
        return html;
    }

};