package com.enonic.xp.loader.format;

import java.io.IOException;

import com.google.common.base.Charsets;
import com.google.common.io.ByteSource;

public class FormatParser
{
    public static Format parse( final String header, final String fileName )
    {
        return doParse( header, fileName );
    }

    public static Format parse( final ByteSource source, final String fileName )
    {
        try
        {
            final String header = source.asCharSource( Charsets.UTF_8 ).readFirstLine();
            return doParse( header, fileName );

        }
        catch ( IOException e )
        {
            throw new RuntimeException( "Could not read file" );
        }
    }

    private static Format doParse( final String header, final String fileName )
    {
        if ( fileName.endsWith( ".csv" ) || fileName.endsWith( ".txt" ) )
        {
            return CsvFormatParser.parse( header );
        }

        throw new IllegalArgumentException( "Unsupported file type [" + fileName + "]" );

    }

}
