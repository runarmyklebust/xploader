package com.enonic.xp.loader.parser;

import java.util.Map;

public interface LineParser
{

    Map<String, String> parse( final String value, final boolean failOnErrors );
}
