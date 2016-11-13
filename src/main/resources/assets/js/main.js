var currentFieldData = null;

$(function () {
    // getStatus();
    //  setInterval(function () {
    //      getStatus();
    //  }, 2000);

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
    var extraDataTd = $('#extra-data-td-' + index);

    var siblingSelectId = "sibling-selector-" + index;

    html = "";

    if (value === 'geoPointLat') {
        extraDataTd.html(renderSiblingsHtml(siblingSelectId, index, "Longitude field"));
    } else if (value === 'geoPointLon') {
        extraDataTd.html(renderSiblingsHtml(siblingSelectId, index, "Latitude field"));
    }

    var select = $("#" + siblingSelectId);

    select.material_select();
};

var renderSiblingsHtml = function (siblingSelectId, index, type) {

    var html = "<div class='input-field'>";
    html += "<select id='" + siblingSelectId + "' onchange='disableSiblingField(this)'>";
    html += "<option value='disabled selected'>Choose</option>";

    currentFieldData.result.fields.forEach(function (field) {
        var id = "field-name-" + index++;
        html += "<option value='" + id + "'>" + field.name + "</option>";
    });
    html += "</select>";
    html += "<label for='" + siblingSelectId + "'> set" + type + "</label>";
    html += "</div>";

    return html;
};

var disableSiblingField = function (element, type) {
    var value = element.value;
    var index = value.match(/\d+$/)[0];

    $("#" + "field-skip-" + index).prop('checked', true);
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

function getStatus() {
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
}

function initalizeValueSelectors(data) {
    var index = 0;
    data.result.fields.forEach(function (field) {
        var id = "value-type-" + index++;
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
            populateFormat(data);
        }
    });

    var populateFormat = function (data) {
        var html = "";
        var index = 0;

        html += "<table class='highlight'>";
        html += "<th></th><th></th><th>Name in file</th><th>Fieldname</th><th>ValueType</th><th></th>";

        var first = true;
        data.result.fields.forEach(function (field) {
            html += createFieldHtml(field, index++, first);
            first = false;
        });
        html += "</table>";
        $('#fieldsList').html(html);

        initalizeValueSelectors(data);
    };

    function createFieldHtml(field, index) {

        var html = "";
        html += "<tr id='format-tr-" + index + "'>";
        html += "<div id='field-set-" + index + "'>";
        html += "<td>" + renderNameElementCheckbox(index) + "</td>";
        html += "<td>" + renderIgnoreCheckbox(index) + "</td>";
        html += "<td>" + renderFieldName(index, field) + "</td>";
        html += "<td>" + renderAlias(index, field) + "</td>";
        html += "<td>" + renderValueType(index) + "</td>";
        html += "<td id='extra-data-td-" + index + "'></td>";
        html += "</div>";
        html += "</tr>";
        return html;
    }

    function renderIgnoreCheckbox(index) {
        return renderCheckbox("field-skip-" + index, "Skip");
    }

    function renderNameElementCheckbox(index) {
        return renderCheckbox("field-nodeNameElement-" + index, "Name-part");
    }

    function renderFieldName(index, field) {
        var name = "field-name-" + index;
        var value = field.name;
        return renderTextField(name, value);
    }

    function renderAlias(index, field) {
        var name = "field-alias-" + index;
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

        var id = "value-type-" + index;
        var html = "<div class='input-field'>";
        html += "<select name='" + id + "' id='" + id + "' onchange='handleValueTypeChange(this)'>";
        html += "<option value='string'>string</option>";
        html += "<option value='number'>number</option>";
        html += "<option value='instant'>instant</option>";
        html += "<option value='reference'>reference</option>";
        html += "<option value='localDateTime'>localDateTime</option>";
        html += "<option value='localDate'>localDate</option>";
        html += "<option value='localTime'>localTime</option>";
        html += "<option value='geoPointLat'>geoPointLat</option>";
        html += "<option value='geoPointLon'>geoPointLon</option>";
        html += "<option value='geoPointString'>geoPointString</option>";
        html += "</select>";
        html += "</div>";
        return html;
    }

    /*
     html += "<td><input name='field-name-" + index + "' type='textLine' value='" + field.name + "'/></td>";
     html += "<td><input name='field-alias-" + index + "' type='textLine' value='" + field.name + "'/></td>";
     html += "<td><input name='field-skip-" + index + "' type='checkbox'/></td>";
     html += "<td><input name='field-nodeNameElement-" + index + "' type='checkbox'/></td>";
     html += "<td><input name='field-valueType-" + index + "' type='textLine' value='string'></td>";
     */

    function renderCheckbox(name, label) {
        var html = "<div class='input-field'>";
        html += "<input type='checkbox' class='filled-in' id='" + name + "' name='" + name + "'/>";
        html += "<label for='" + name + "'>" + label + "</label>";
        html += "</div>";

        return html;
    }

};