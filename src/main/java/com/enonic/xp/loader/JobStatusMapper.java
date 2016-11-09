package com.enonic.xp.loader;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public class JobStatusMapper
    implements MapSerializable
{

    private final JobStatus jobStatus;


    public JobStatusMapper( final JobStatus jobStatus )
    {
        this.jobStatus = jobStatus;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.value( "jobStatus", jobStatus.name() );
        gen.end();
    }
}
