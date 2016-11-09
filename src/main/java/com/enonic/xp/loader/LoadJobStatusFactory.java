package com.enonic.xp.loader;

import java.util.concurrent.TimeUnit;

import com.google.common.base.Stopwatch;

public class LoadJobStatusFactory
{
    public static LoadJobStatus create( final LoadRunnerTask task )
    {
        final Stopwatch startTimer = task.getStart();

        final long elapsedSeconds = startTimer.elapsed( TimeUnit.SECONDS );

        final String speed = elapsedSeconds > 0 ? ( task.getProcessed() / elapsedSeconds ) + "/s" : "N/A";

        return LoadJobStatus.create().

            processed( task.getProcessed() ).
            runTime( startTimer.toString() ).
            speed( speed ).
            build();
    }

}
