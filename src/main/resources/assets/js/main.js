$(function () {

    getStatus();

    setInterval(function () {
        getStatus();
    }, 2000);
});

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