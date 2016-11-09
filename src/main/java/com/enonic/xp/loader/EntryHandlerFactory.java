package com.enonic.xp.loader;

import com.enonic.xp.content.ContentService;
import com.enonic.xp.loader.entryhandler.ContentEntryHandler;
import com.enonic.xp.loader.entryhandler.EntryHandler;
import com.enonic.xp.loader.entryhandler.NodeEntryHandler;
import com.enonic.xp.loader.format.Format;
import com.enonic.xp.node.NodeService;

public class EntryHandlerFactory
{
    private NodeService nodeService;

    private ContentService contentService;

    private EntryHandlerFactory( final Builder builder )
    {
        nodeService = builder.nodeService;
        contentService = builder.contentService;
    }

    public static Builder create()
    {
        return new Builder();
    }


    public EntryHandler create( final Format format, final String entryHandlerName )
    {

        if ( "content".equals( entryHandlerName ) )
        {
            return ContentEntryHandler.create().
                contentService( this.contentService ).
                format( format ).
                build();
        }

        if ( "node".equals( entryHandlerName ) )
        {
            return new NodeEntryHandler( this.nodeService, format );
        }

        throw new LoaderException( "Unknown entry-handler: " + entryHandlerName );
    }

    public static final class Builder
    {
        private NodeService nodeService;

        private ContentService contentService;

        private Builder()
        {
        }

        public Builder nodeService( final NodeService val )
        {
            nodeService = val;
            return this;
        }

        public Builder contentService( final ContentService val )
        {
            contentService = val;
            return this;
        }

        public EntryHandlerFactory build()
        {
            return new EntryHandlerFactory( this );
        }
    }
}
