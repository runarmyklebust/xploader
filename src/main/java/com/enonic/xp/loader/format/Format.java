package com.enonic.xp.loader.format;

import java.util.List;

public class Format
{
    List<Field> fields;

    public Format( final List<Field> fields )
    {
        this.fields = fields;
    }

    public String getName( final int index )
    {
        return this.fields.get( index ).getName();
    }

    public Field get( final int index )
    {
        return this.fields.get( index );
    }

    public List<Field> getFields()
    {
        return fields;
    }

    @Override
    public String toString()
    {
        return "Format{" +
            "fields=" + fields +
            '}';
    }
}
