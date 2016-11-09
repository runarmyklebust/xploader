package com.enonic.xp.loader.format;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public class FormatMapper
    implements MapSerializable
{
    private final Format format;

    public FormatMapper( final Format format )
    {
        this.format = format;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        final MapGenerator array = gen.array( "fields" );

        for ( int i = 0; i < format.getFields().size(); i++ )
        {
            final Field field = format.get( i );

            gen.map( );
            gen.value( "name", field.getName() );
            gen.value( "alias", field.getAlias() );
            gen.value( "skip", field.isSkip() );
            gen.end();
        }

        gen.end();
    }
}
