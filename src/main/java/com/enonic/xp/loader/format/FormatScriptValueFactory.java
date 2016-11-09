package com.enonic.xp.loader.format;

import java.util.List;

import com.google.common.collect.Lists;

import com.enonic.xp.data.ValueTypes;
import com.enonic.xp.script.ScriptValue;

public class FormatScriptValueFactory
{
    public static Format create( final ScriptValue scriptValue )
    {
        List<Field> fieldsList = Lists.newLinkedList();

        final List<ScriptValue> fields = scriptValue.getArray();

        for ( final ScriptValue field : fields )
        {
            fieldsList.add( Field.create().
                name( field.getMember( "name" ).getValue( String.class ) ).
                alias( field.getMember( "alias" ).getValue( String.class ) ).
                skip( field.getMember( "skip" ).getValue( Boolean.class ) ).
                isNodeNameElement( field.getMember( "nodeNameElement" ).getValue( Boolean.class ) ).
                valueType( ValueTypes.getByName( field.getMember( "valueType" ).getValue( String.class ) ) ).
                build() );
        }

        return new Format( fieldsList );
    }

}
