package com.enonic.xp.loader.format;

import com.enonic.xp.data.ValueType;

public class Field
{
    private boolean nodeNameField;

    private String name;

    private String alias;

    private boolean skip;

    private final ValueType valueType;

    private Field( final Builder builder )
    {
        nodeNameField = builder.id;
        name = builder.name;
        alias = builder.alias;
        skip = builder.skip;
        valueType = builder.valueType;
    }

    public String getName()
    {
        return name;
    }

    public String getAlias()
    {
        return alias;
    }

    public boolean isSkip()
    {
        return skip;
    }

    public boolean isNodeNameField()
    {
        return nodeNameField;
    }

    public ValueType getValueType()
    {
        return valueType;
    }

    public static Builder create()
    {
        return new Builder();
    }

    public static final class Builder
    {
        private String name;

        private String alias;

        private boolean skip = false;

        private ValueType valueType;

        private boolean id = false;

        private Builder()
        {
        }

        public Builder name( final String val )
        {
            this.name = val;
            return this;
        }

        public Builder alias( final String val )
        {
            this.alias = val;
            return this;
        }

        public Builder skip( final boolean val )
        {
            this.skip = val;
            return this;
        }

        public Builder valueType( final ValueType val )
        {
            valueType = val;
            return this;
        }

        public Builder isNodeNameElement( final boolean isNodeNameElement )
        {
            this.id = isNodeNameElement;
            return this;
        }

        public Field build()
        {
            return new Field( this );
        }
    }

    @Override
    public String toString()
    {
        return "Field{" +
            "id=" + nodeNameField +
            ", name='" + name + '\'' +
            ", alias='" + alias + '\'' +
            ", skip=" + skip +
            ", valueType=" + valueType +
            '}';
    }
}
