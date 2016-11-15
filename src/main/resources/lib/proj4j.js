var bean = __.newBean('com.enonic.xp.loader.Proj4jBean');

exports.fromUTM = function (longZone, latZone, easting, northing, unit) {

    var result = bean.fromUTM(longZone, latZone, easting, northing, unit);
    return __.toNativeObject(result);
};
