package com.enonic.xp.loader.parser;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import com.google.common.collect.Maps;

import com.enonic.xp.loader.tool.FieldUtil;
import com.enonic.xp.loader.format.Format;

public class CSVLineParser
    implements LineParser
{
    private final static Pattern pattern = Pattern.compile( "\\\"([^\\\"]*)\\\"|(?<=,|^)([^,]*)(?=,|$)" );

    private final Format format;

    public CSVLineParser( final Format format )
    {
        this.format = format;
    }

    @Override
    public Map<String, String> parse( final String input, final boolean failOnErrors )
    {
        final HashMap<String, String> valueMap = Maps.newHashMap();

        String[] splitted = input.split( ",(?=([^\"]*\"[^\"]*\")*[^\"]*$)" );

        int i = 0;
        for ( final String value : splitted )
        {
            try
            {
                valueMap.put( format.getName( i++ ), FieldUtil.clean( value ) );
            }
            catch ( Exception e )
            {
                if ( failOnErrors )
                {
                    throw new RuntimeException( "Failed to parse line " + input, e );
                }
                else
                {
                    System.out.println( "Warning: Failed to parse [" + input + "]" );
                }
            }
        }

        return valueMap;
    }
}
