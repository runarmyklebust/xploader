var mustache = require('/lib/xp/mustache');
var portal = require('/lib/xp/portal');
var repoLib = require('/lib/xp/repo');


exports.get = function (req) {

    var view = resolve('xploader.html');

    var repoList = repoLib.list();

    log.info("RepoList: %s", repoList);

    var model = {
        jsUrl: portal.assetUrl({path: "/js/main.js"}),
        cssUrl: portal.assetUrl({path: "/css/main.css"}),
        repoList: repoList
    };

    model.loaderServiceUrl = portal.serviceUrl({
        service: 'csv-loader-service'
    });

    model.statusServiceUrl = portal.serviceUrl({
        service: 'status-service'
    });

    model.parserServiceUrl = portal.serviceUrl({
        service: 'fileParser'
    });


    return {
        contentType: 'text/html',
        body: mustache.render(view, model)
    };
};
