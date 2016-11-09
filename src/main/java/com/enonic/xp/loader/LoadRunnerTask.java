package com.enonic.xp.loader;

import java.util.concurrent.Callable;

import com.google.common.base.Stopwatch;
import com.google.common.io.ByteSource;

import com.enonic.xp.context.Context;
import com.enonic.xp.loader.dataloader.DataLoader;
import com.enonic.xp.loader.dataloader.DataLoaderParams;
import com.enonic.xp.loader.entryhandler.EntryHandler;
import com.enonic.xp.loader.format.Format;
import com.enonic.xp.loader.parser.LineParser;

public class LoadRunnerTask
    implements Callable<JobStatus>
{
    private DataLoader dataLoader;

    private EntryHandler handler;

    private final ByteSource source;

    private final LineParser lineParser;

    private final Context runContext;

    private boolean done;

    private Stopwatch start;

    private JobStatus result;

    private LoadRunnerTask( final Builder builder )
    {
        dataLoader = builder.dataLoader;
        handler = builder.handler;
        source = builder.source;
        lineParser = builder.lineParser;
        runContext = builder.runContext;
    }

    public static Builder create()
    {
        return new Builder();
    }

    public long getProcessed()
    {
        return dataLoader.processed();
    }

    public Stopwatch getStart()
    {
        return start;
    }

    public JobStatus getResult()
    {
        return result;
    }

    @Override
    public JobStatus call()
    {
        this.start = Stopwatch.createStarted();

        runContext.runWith( () -> this.dataLoader.load( DataLoaderParams.create().
            lineParser( lineParser ).
            failOnErrors( true ).
            hasHeaderRow( true ).
            handler( handler ).
            source( source ).
            build() ) );

        this.start.stop();

        return JobStatus.DONE;
    }

    public long processed()
    {
        return this.dataLoader.processed();
    }

    public LoadJobStatus getStatus()
    {
        return LoadJobStatusFactory.create( this );
    }

    public static final class Builder
    {
        private DataLoader dataLoader;

        private Format format;

        private EntryHandler handler;

        private ByteSource source;

        private LineParser lineParser;

        private Context runContext;

        private Builder()
        {
        }

        public Builder dataLoader( final DataLoader val )
        {
            dataLoader = val;
            return this;
        }

        public Builder handler( final EntryHandler val )
        {
            handler = val;
            return this;
        }

        public Builder source( final ByteSource val )
        {
            source = val;
            return this;
        }

        public Builder lineParser( final LineParser val )
        {
            lineParser = val;
            return this;
        }

        public Builder runContext( final Context val )
        {
            runContext = val;
            return this;
        }

        public LoadRunnerTask build()
        {
            return new LoadRunnerTask( this );
        }
    }
}
