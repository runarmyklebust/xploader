var repoLib = require('/lib/xp/repo');

exports.post = function (req) {

    var repoId = req.params.repoId;

    if (!repoId) {
        return returnError("no repo-id given");
    }

    var existingRepo = repoLib.get({
        id: repoId
    });

    if (existingRepo) {
        return returnError("repoId [" + repoId + "] already exists");
    }

    var createdRepo = repoLib.create({
        id: repoId
    });

    return returnMessage("Repository [" + repoId + "] created");
};

var returnMessage = function (message) {
    return {
        contentType: 'application/json',
        body: {
            message: message
        }
    }
};

var returnError = function (message) {
    return {
        contentType: 'application/json',
        body: {
            error: message
        }
    }
};

