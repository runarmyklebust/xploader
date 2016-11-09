package com.enonic.xp.loader.dataloader;

public interface DataLoader
{
    void load( final DataLoaderParams params );

    long processed();

}
