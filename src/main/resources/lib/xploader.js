var bean = __.newBean('com.enonic.xp.loader.LoaderBean');

exports.load = function (source, format, entryHandler) {

    var nativeFields = __.toScriptValue(format);
    var result = bean.load(source, nativeFields, entryHandler);

    return __.toNativeObject(result);
};

exports.publish = function () {
    bean.publish();
};


exports.status = function () {
    return __.toNativeObject(bean.getStatus());
};


exports.getFormat = function (source, fileName) {
    var result = bean.getFormat(source, fileName);
    return __.toNativeObject(result);
};
