package com.enonic.xp.loader;

import java.util.Map;

import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.data.ValueType;
import com.enonic.xp.data.ValueTypes;
import com.enonic.xp.loader.format.Field;
import com.enonic.xp.loader.format.Format;

public class PropertyTreeFactory
{

    public static PropertyTree create( final Format format, final Map<String, String> values )
    {
        final PropertyTree data = new PropertyTree();

        for ( final Field field : format.getFields() )
        {
            final String fieldValue = field.getName();

            final ValueType valueType = field.getValueType();

            if ( valueType == ValueTypes.DOUBLE )
            {
                data.setDouble( field.getAlias(), ValueTypes.DOUBLE.convert( fieldValue ) );
            }
            else if ( valueType == ValueTypes.GEO_POINT )
            {
                data.setGeoPoint( field.getAlias(), ValueTypes.GEO_POINT.convert( fieldValue ) );
            }
            else if ( valueType == ValueTypes.DATE_TIME )
            {
                data.setInstant( field.getAlias(), ValueTypes.DATE_TIME.convert( fieldValue ) );
            }
            else
            {
                data.setString( field.getAlias(), values.get( fieldValue ) );
            }
        }

        return data;
    }
}
