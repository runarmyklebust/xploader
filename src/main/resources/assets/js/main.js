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

var RUNNING_JOBS_DIV = "#runningJobs";
var LOAD_BUTTON = "#loadBtn";
var JOBS_COUNTER = "#jobsCounter";

var STEPS = {
    "source": 1,
    "mapping": 2,
    "settings": 3,
    "load": 4
};

$(function () {

    $('#createRepoButton').click(function () {
        createRepo();
    });

    $('#deleteRepoButton').click(function () {
        deleteRepo();
    });

    initializeView();

    $(LOAD_BUTTON).click(function () {
        startDataLoad();
    });

    getJobsListing();
    setInterval(getJobsListing, 1000)

    $("#selectRepoList").change(function () {
        $(LOAD_BUTTON).attr('disabled', false);
    });


});

var initializeView = function () {
    $(JOBS_COUNTER).hide();
    $('#status').hide();
    $('#messageBox').hide();
    $(GCS_SELECTOR_DIV).hide();
    $(WGS84_DEG_SELECTOR).hide();
    $(WGS84_UTM_SELECTOR).hide();
    $(RUNNING_JOBS_DIV).hide();
    $(LOAD_BUTTON).attr('disabled', true);
    $(this).addClass('active');
    deactivateSteps([STEPS.mapping, STEPS.settings, STEPS.load]);
    goStep(STEPS.source);
    toggleLoadTab();
};

var getStepIndicator = function (stepNum) {
    return $("#stepIndicator" + stepNum);
};

var deactivateSteps = function (steps) {
    steps.forEach(function (stepNum) {
        var indicator = getStepIndicator(stepNum);
        indicator.attr('disabled', true);
    });
};

var activateSteps = function (steps) {
    steps.forEach(function (stepNum) {
        var indicator = getStepIndicator(stepNum);
        indicator.attr('disabled', false);
    });
};

var goStep = function (toActivate) {
    var stepNum = 1;
    var currentStep = getStep(stepNum);

    while (currentStep) {
        if (stepNum != toActivate) {
            currentStep.hide();
            getStepIndicator(stepNum).removeClass("active");
        } else {
            currentStep.show();
            getStepIndicator(stepNum).addClass("active");
        }
        currentStep = getStep(++stepNum);
    }
};

var getStep = function (num) {
    var element = $("#step" + num);
    if (element.length) {
        return element;
    } else {
        return null;
    }
};

var toggleLoadTab = function () {
    renderLoadTab();
    activateTab("load");
    deactivateTab("repo");
    deactivateTab("jobs");
};

var toggleRepoTab = function () {
    renderRepoTab();
    activateTab("repo");
    deactivateTab("jobs");
    deactivateTab("load");
};

var toggleJobsTab = function () {
    activateTab("jobs");
    deactivateTab("load");
    deactivateTab("repo");
};

var activateTab = function (elementName) {

    $("#" + elementName + "Nav").addClass("active");
    $("#" + elementName + "Tab").show();
};

var deactivateTab = function (elementName) {
    $("#" + elementName + "Nav").removeClass("active");
    $("#" + elementName + "Tab").hide();
};

var renderLoadTab = function () {
    getRepoList($('#selectRepoId'));
};

var renderRepoTab = function () {
    getRepoList($('#deleteRepoId'));
};

var startDataLoad = function () {
    var data = new FormData($('#loaderForm')[0]);
    jQuery.ajax({
        url: dataLoaderService,
        cache: false,
        data: data,
        type: 'POST',
        contentType: false,
        processData: false,
        success: function (result) {
            toggleJobsTab();
        }
    });
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
    html += '<option value="" disabled selected>Select repository</option>';
    result.repoList.forEach(function (entry) {
        html += "<option value='" + entry.id + "'>" + entry.id + "</option>";
    });

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


var getJobsListing = function () {
    jQuery.ajax({
        url: getJobsServiceUrl,
        cache: false,
        type: 'GET',
        success: function (result) {
            renderJobsList(result);
        }
    });
};

var renderJobsList = function (result) {
    var html = "";

    var runningJobs = 0;

    result.tasks.forEach(function (task) {
        if (task.state == "RUNNING") {
            runningJobs++;
        }
        html += renderJobStatus(task)
    });

    $(RUNNING_JOBS_DIV).html(html);
    $(RUNNING_JOBS_DIV).show();

    renderJobsCounter(runningJobs);
};

var renderJobsCounter = function (runningJobs) {

    var jobsCounterEl = $(JOBS_COUNTER);

    if (runningJobs == 0) {
        jobsCounterEl.hide();
    } else {
        jobsCounterEl.text(runningJobs);
        jobsCounterEl.show();
    }

};

var renderJobStatus = function (task) {
    var html = "";


    var style = getCardStyle(task);
    html += "<div class='card horizontal " + style.color + "'>";
    html += "  <div class='card-content'>";
    html += "    <i class='material-icons large'>" + style.icon + "</i>";
    html += "   </div>";
    html += "   <div class='card-content'>";
    html += "    <p><span class='jobStatusLabel'>Description: </span> " + task.description + "</p>";
    html += "    <p><span class='jobStatusLabel'>State: </span>" + task.state + "</p>";
    html += "    <p><span class='jobStatusLabel'>Progress: </span>" + task.progress.info + "</p>";
    html += "  </div>";
    html += "</div>";

    return html;
};

var getCardStyle = function (task) {

    var style = {};

    if (task.state == "RUNNING") {
        style.color = "green lighten-2";
        style.icon = "loop"
    }

    if (task.state == "FINISHED") {
        style.color = "grey lighten-2";
        style.icon = "done";
    }

    if (task.state == "FAILED") {
        style.color = "red lighten-2";
        style.icon = "error_outline";
    }

    return style
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
            activateSteps([STEPS.mapping, STEPS.settings, STEPS.load]);
            goStep(STEPS.mapping);
        }
    });

    var renderFormat = function (data) {
        var html = "";
        var index = 0;

        html += "<table class='highlight'>";
        html += "<th>Use in path</th><th>Skip</th><th>Sourcefield</th><th>Fieldname</th><th>ValueType</th><th></th>";

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
        html += "<td class='checkbox'>" + renderNameElementCheckbox(index) + "</td>";
        html += "<td class='checkbox'>" + renderIgnoreCheckbox(index) + "</td>";
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

        return renderCheckbox(FORMAT_NODE_NAME + index, "Name");
    }

    function renderFieldName(index, field) {

        var name = FORMAT_FIELD_NAME + index;
        var value = field.name;
        return renderTextField(name, value, true);
    }

    function renderAlias(index, field) {
        var name = FORMAT_FIELD_ALIAS + index;
        var value = field.name;
        return renderTextField(name, value, false);
    }

    function renderTextField(name, value, immutable) {
        var html = "<div class='input-field'>";

        if (immutable) {
            html +=
                "<input name='" + name + "' id='" + name + "' value='" + value + "' type='text' class='validate' readonly=''" + immutable +
                "''>";
        } else {
            html += "<input name='" + name + "' id='" + name + "' value='" + value + "' type='text' class='validate'>";
        }
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
        html += "<label for='" + name + "'></label>";
        html += "</div>";
        return html;
    }

};