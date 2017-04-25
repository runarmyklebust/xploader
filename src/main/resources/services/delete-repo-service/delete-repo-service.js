var repoLib = require('/lib/xp/repo');

exports.post = function (req) {

    var repoId = req.params.repoId;

    if (!repoId) {
        return returnError("no repo-id given");
    }

    if (repoId === "cms-repo" || repoId === "system-repo") {
        return returnError("Not allowed to delete repository [" + repoId + "]");
    }

    var existingRepo = repoLib.get(repoId);

    if (!existingRepo) {
        return returnError("repoId [" + repoId + "] does not exists");
    }

    var result = repoLib.delete(repoId);

    return returnMessage("Repository [" + repoId + "] deleted: [" + result + "]");
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
