package com.enonic.xp.loader.entryhandler;

public class EntryHandlerResult
{
    private long timeUsed;

    private int successful;

    public EntryHandlerResult( final long timeUsed, final int successful )
    {
        this.timeUsed = timeUsed;
        this.successful = successful;
    }

    public long getTimeUsed()
    {
        return timeUsed;
    }

    public int getSuccessful()
    {
        return successful;
    }
}
