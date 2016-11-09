package com.enonic.xp.loader.tool;

public class FieldUtil
{

    public static String clean( final String value )
    {
        String cleaned = value;

        if ( value.startsWith( "\"" ) )
        {
            cleaned = removeFirst( cleaned );
        }

        if ( value.endsWith( "\"" ) )
        {
            cleaned = removeLast( cleaned );
        }

        return cleaned;
    }


    public static String removeFirst( String s )
    {
        return s.substring( 1 );
    }


    public static String removeLast( String s )
    {
        return s.substring( 0, s.length() - 1 );
    }

}
