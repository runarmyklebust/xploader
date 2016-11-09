package com.enonic.xp.loader.entryhandler;

import java.util.Map;

public interface EntryHandler
{
    void handle( Map<String, String> values );

    int getTotal();

    String getName();

}
