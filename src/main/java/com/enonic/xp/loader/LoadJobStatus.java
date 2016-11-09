package com.enonic.xp.loader;

public class LoadJobStatus
{
    private LoadStatus loadStatus;

    private final long processed;

    private final String speed;

    private final String runTime;

    private LoadJobStatus( final Builder builder )
    {
        loadStatus = builder.loadStatus;
        processed = builder.processed;
        speed = builder.speed;
        runTime = builder.runTime;
    }

    public static Builder create()
    {
        return new Builder();
    }

    public long getProcessed()
    {
        return processed;
    }

    public String getSpeed()
    {
        return speed;
    }

    public String getRunTime()
    {
        return runTime;
    }

    public LoadStatus getLoadStatus()
    {
        return loadStatus;
    }

    public static final class Builder
    {
        private long processed;

        private String speed;

        private String runTime;

        private LoadStatus loadStatus;

        private Builder()
        {
        }

        public Builder processed( final long val )
        {
            processed = val;
            return this;
        }

        public Builder speed( final String val )
        {
            speed = val;
            return this;
        }

        public Builder runTime( final String val )
        {
            runTime = val;
            return this;
        }

        public LoadJobStatus build()
        {
            return new LoadJobStatus( this );
        }

        public Builder loadStatus( final LoadStatus val )
        {
            loadStatus = val;
            return this;
        }
    }

    @Override
    public String toString()
    {
        return "LoadStatus{" +
            "processed=" + processed +
            ", speed='" + speed + '\'' +
            ", runTime='" + runTime + '\'' +
            '}';
    }
}
