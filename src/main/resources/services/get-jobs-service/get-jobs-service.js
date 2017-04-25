var taskLib = require('/lib/xp/task');

exports.get = function (req) {
    
    var tasks = taskLib.list();

    return {
        contentType: 'application/json',
        body: {
            tasks: tasks
        }
    }
};
