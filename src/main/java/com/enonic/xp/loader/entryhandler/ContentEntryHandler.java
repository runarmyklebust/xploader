package com.enonic.xp.loader.entryhandler;

import java.util.Map;

import com.google.common.base.Stopwatch;

import com.enonic.xp.content.Content;
import com.enonic.xp.content.ContentConstants;
import com.enonic.xp.content.ContentIds;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.CreateContentParams;
import com.enonic.xp.content.PushContentParams;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.loader.PropertyTreeFactory;
import com.enonic.xp.loader.format.Format;
import com.enonic.xp.loader.tool.NodeNameFactory;
import com.enonic.xp.schema.content.ContentTypeName;

public class ContentEntryHandler
    implements EntryHandler
{
    private final ContentService contentService;

    private final Format format;

    private Content rootContent;

    private final ContentPath root = ContentPath.from( ContentPath.ROOT, "testing" );

    private int total = 0;

    private ContentEntryHandler( final Builder builder )
    {
        contentService = builder.contentService;
        format = builder.format;
        total = builder.total;

        if ( !this.contentService.contentExists( root ) )
        {
            final Content rootContent = this.contentService.create( CreateContentParams.create().
                displayName( root.getName() ).
                name( root.getName() ).
                parent( root.getParentPath() ).
                type( ContentTypeName.folder() ).
                contentData( new PropertyTree() ).
                build() );

            System.out.println( "#### Created root content: " + rootContent.getPath() );
        }
        else
        {
            System.out.println( "#### Content root node already created" );
        }

    }

    @Override
    public void handle( final Map<String, String> values )
    {
        final PropertyTree data = PropertyTreeFactory.create( format, values );
        final String nodeName = NodeNameFactory.create( this.format, values );

        final Content content = this.contentService.create( CreateContentParams.create().
            parent( root ).
            displayName( nodeName ).
            contentData( data ).
            type( ContentTypeName.unstructured() ).
            refresh( false ).
            build() );

        total++;
    }

    public void publish()
    {
        final Content rootNode = this.contentService.getByPath( this.root );

        System.out.println( "####### Starting push" );

        final Stopwatch started = Stopwatch.createStarted();
        this.contentService.push( PushContentParams.create().
            includeChildren( true ).
            target( ContentConstants.BRANCH_MASTER ).
            contentIds( ContentIds.from( rootNode.getId() ) ).
            includeDependencies( true ).
            build() );

        System.out.println( "###### Timeused publish: " + started.stop().toString() );
    }

    @Override
    public int getTotal()
    {
        return this.total;
    }

    @Override
    public String getName()
    {
        return "content";
    }

    public static Builder create()
    {
        return new Builder();
    }

    public static final class Builder
    {
        private ContentService contentService;

        private Format format;

        private int total;

        private Builder()
        {
        }

        public Builder contentService( final ContentService val )
        {
            contentService = val;
            return this;
        }

        public Builder format( final Format val )
        {
            format = val;
            return this;
        }


        public Builder total( final int val )
        {
            total = val;
            return this;
        }

        public ContentEntryHandler build()
        {
            return new ContentEntryHandler( this );
        }
    }
}
