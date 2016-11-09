package com.enonic.xp.loader;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public class StatusMapper
    implements MapSerializable
{
    private final LoadJobStatus status;

    private final JobStatus jobStatus;


    public StatusMapper( final LoadJobStatus status, final JobStatus jobStatus )
    {
        this.status = status;
        this.jobStatus = jobStatus;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {

        gen.value( "processed", this.status.getProcessed() );
        gen.value( "speed", this.status.getSpeed() );
        gen.value( "runTime", this.status.getRunTime() );
        gen.value( "jobStatus", jobStatus.name() );
        gen.end();
    }
}
