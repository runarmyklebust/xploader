package com.enonic.xp.loader.dataloader;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.Map;

import com.google.common.base.Stopwatch;
import com.google.common.io.ByteSource;

public class CSVDataLoader
    extends AbstractDataLoader
{
    private long processed = 0;

    @Override
    public void load( final DataLoaderParams params )
    {
        System.out.println( "Starting loading CVS data" );

        final ByteSource source = params.getSource();

        boolean firstRow = true;

        final Stopwatch timer = Stopwatch.createStarted();

        try (InputStream in = source.openStream();
             InputStreamReader isr = new InputStreamReader( in, Charset.forName( "UTF-8" ) );
             BufferedReader br = new BufferedReader( isr )
        )
        {
            String line;

            while ( ( line = br.readLine() ) != null )
            {
                if ( firstRow && params.isHasHeaderRow() )
                {
                    firstRow = false;
                    continue;
                }

                processLine( line, params );
                processed++;
            }

            System.out.printf( "Processed [%s] entries in [%s] \r\n", processed, timer.stop() );

        }
        catch ( IOException e )
        {
            e.printStackTrace();
        }
    }

    public long processed()
    {
        return processed;
    }

    private void processLine( final String line, final DataLoaderParams params )
    {
        final Map<String, String> valueMap = params.getLineParser().parse( line, params.isFailOnErrors() );
        params.getHandler().handle( valueMap );
    }
}
