var mustache = require('/lib/xp/mustache');
var portal = require('/lib/xp/portal');
var repoLib = require('/lib/xp/repo');


exports.get = function (req) {

    var view = resolve('xploader.html');

    var repoList = repoLib.list();

    var model = {
        jsUrl: portal.assetUrl({path: "/js/main.js"}),
        assetsUrl: portal.assetUrl({path: ""}),
        repoList: repoList
    };

    model.dataLoaderService = portal.serviceUrl({
        service: 'load-data-service'
    });

    model.createRepoServiceUrl = portal.serviceUrl({
        service: 'create-repo-service'
    });

    model.deleteRepoServiceUrl = portal.serviceUrl({
        service: 'delete-repo-service'
    });

    model.listRepoServiceUrl = portal.serviceUrl({
        service: 'list-repo-service'
    });

    model.statusServiceUrl = portal.serviceUrl({
        service: 'status-service'
    });

    model.parserServiceUrl = portal.serviceUrl({
        service: 'fileParser'
    });

    model.getJobsServiceUrl = portal.serviceUrl({
        service: 'get-jobs-service'
    });


    return {
        contentType: 'text/html',
        body: mustache.render(view, model)
    };
};
