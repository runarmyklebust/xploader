$(function () {

    getStatus();

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
    refreshRepoList();
});


var initializeView = function () {
    $('#status').hide();
    $('#messageBox').hide();
    toggleRepoManager();
};

var toogleLoadManager = function () {
    $('#loadManager').show();
    $('#repoManager').hide();
};

var toggleRepoManager = function () {
    $('#loadManager').hide();
    $('#repoManager').show();
};

function createRepo() {
    var repoId = $('#repoIdInput').val();

    var data = {
        repoId: repoId
    };

    jQuery.ajax({
        url: createRepoServiceUrl,
        cache: false,
        data: data,
        type: 'POST',
        success: function (result) {
            renderRepoView(result);
            refreshRepoList();
        }
    });
}


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
            renderRepoView(result);
            refreshRepoList();
        }
    });
}

var refreshRepoList = function () {
    jQuery.ajax({
        url: listRepoServiceUrl,
        cache: false,
        type: 'GET',
        success: function (result) {
            renderRepoList(result)
        }
    });
};

var renderRepoList = function (result) {
    console.log(result);

    var html = "";
    result.repoList.forEach(function (entry) {
        html += "<option value='" + entry + "'>" + entry.id + "</option>";
    });
    $('#deleteRepoId').html(html);
    $('#deleteRepoId').material_select();
};

var renderRepoView = function (result) {
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

        html += "<table class='field-entry'>";
        html += "<th>Input</th><th>Xp-FieldName</th><th>Ignore</th><th>Node-name element</th><th>ValueType</th>";

        var first = true;

        data.result.fields.forEach(function (field) {
            html += createFieldHtml(field, index++, first);
            first = false;
        });

        html += "</table>";

        $('#fieldsList').html(html);
    }

    function createFieldHtml(field, index) {
        var html = "";
        html += "<tr>";
        html += "<td><input name='field-name-" + index + "' type='textLine' value='" + field.name + "'/></td>";
        html += "<td><input name='field-alias-" + index + "' type='textLine' value='" + field.name + "'/></td>";
        html += "<td><input name='field-skip-" + index + "' type='checkbox'/></td>";
        html += "<td><input name='field-nodeNameElement-" + index + "' type='checkbox'/></td>";
        html += "<td><input name='field-valueType-" + index + "' type='textLine' value='string'></td>";
        html += "</tr>";
        return html;
    }

};