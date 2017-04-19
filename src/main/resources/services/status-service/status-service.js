var taskLib = require('/lib/xp/task');

exports.get = function (req) {

    var taskId = req.params.taskId;
    var model = {};

    if (!taskId) {
        return errorMsg("Missing task-id");
    }

    var task = taskLib.get(taskId);

    if (!task) {
        return errorMsg("Task with id [" + taskId + "] not found ");
    }

    model.progress = task.progress;
    model.description = task.description;
    model.id = task.id;
    model.state = task.state

    return {
        contentType: 'application/json',
        body: model
    }
};


var errorMsg = function (msg) {

    return {
        contentType: 'application/json',
        body: {
            error: msg
        }
    }
};