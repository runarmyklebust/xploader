package com.enonic.xp.loader.tool;

import java.util.Map;

import com.google.common.base.Strings;

import com.enonic.xp.loader.LoaderException;
import com.enonic.xp.loader.format.Field;
import com.enonic.xp.loader.format.Format;

public class NodeNameFactory
{
    public static String create( final Format format, final Map<String, String> values )
    {
        String nodeName = "";

        for ( final Field field : format.getFields() )
        {
            if ( field.isNodeNameField() )
            {
                nodeName += values.get( field.getName() );
            }
        }

        if ( Strings.isNullOrEmpty( nodeName ) )
        {
            throw new LoaderException( "Id must be set" );
        }

        return nodeName;
    }

}
