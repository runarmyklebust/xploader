package com.enonic.xp.loader;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import com.google.common.base.Stopwatch;
import com.google.common.io.ByteSource;

import com.enonic.xp.content.Content;
import com.enonic.xp.content.ContentConstants;
import com.enonic.xp.content.ContentIds;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.PushContentParams;
import com.enonic.xp.content.PushContentsResult;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.loader.dataloader.CSVDataLoader;
import com.enonic.xp.loader.entryhandler.EntryHandler;
import com.enonic.xp.loader.format.Format;
import com.enonic.xp.loader.format.FormatMapper;
import com.enonic.xp.loader.format.FormatParser;
import com.enonic.xp.loader.format.FormatScriptValueFactory;
import com.enonic.xp.loader.parser.CSVLineParser;
import com.enonic.xp.node.NodeService;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class LoaderBean
    implements ScriptBean
{
    private ContentService contentService;

    private NodeService nodeService;

    private EntryHandlerFactory entryHandlerFactory;

    private LoadRunnerTask loadRunnerTask = null;

    private ExecutorService executor = Executors.newFixedThreadPool( 1 );

    private Future<JobStatus> result;

    @SuppressWarnings("unused")
    public JobStatus load( final ByteSource source, final ScriptValue fields, final String entryHandlerName )
    {
        if ( loadRunnerTask != null && !result.isDone() )
        {
            return JobStatus.ALREADY_RUNNING;
        }

        final Format format = FormatScriptValueFactory.create( fields );
        final CSVDataLoader csvDataLoader = new CSVDataLoader();

        final EntryHandler entryHandler;

        this.loadRunnerTask = LoadRunnerTask.create().
            runContext( ContextAccessor.current() ).
            dataLoader( csvDataLoader ).
            handler( entryHandlerFactory.create( format, entryHandlerName ) ).
            lineParser( new CSVLineParser( format ) ).
            source( source ).
            build();

        this.result = executor.submit( this.loadRunnerTask );

        return JobStatus.RUNNING;
    }

    @SuppressWarnings("unused")
    public void publish()
    {
        final Content content = this.contentService.getByPath( ContentPath.from( ContentPath.ROOT, "testing" ) );

        final Stopwatch timer = Stopwatch.createStarted();

        final PushContentsResult result = this.contentService.push( PushContentParams.create().
            contentIds( ContentIds.from( content.getId() ) ).
            includeDependencies( true ).
            includeChildren( true ).
            target( ContentConstants.BRANCH_MASTER ).
            build() );

        System.out.println( "Published in: " + timer.stop().toString() );

        //final Stopwatch unpublishTimer = Stopwatch.createStarted();

        //this.contentService.unpublishContent( UnpublishContentParams.create().
        //    contentIds( ContentIds.from( content.getId() ) ).
        //    includeChildren( true ).
        //    unpublishBranch( ContentConstants.BRANCH_MASTER ).
        //    build() );

        //System.out.println( "Unpublished in: " + unpublishTimer.stop().toString() );
    }

    @SuppressWarnings("unused")
    public FormatMapper getFormat( final ByteSource source, final String fileName )
    {
        final Format format = FormatParser.parse( source, fileName );

        return new FormatMapper( format );
    }

    public StatusMapper getStatus()
    {
        if ( this.loadRunnerTask == null )
        {
            return new StatusMapper( LoadJobStatus.create().
                processed( 0 ).
                runTime( "Not started" ).
                speed( "Not Started" ).
                build(), JobStatus.NOT_STARTED );
        }

        return new StatusMapper( this.loadRunnerTask.getStatus(), this.result.isDone() ? JobStatus.DONE : JobStatus.RUNNING );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.nodeService = context.getService( NodeService.class ).get();
        this.contentService = context.getService( ContentService.class ).get();
        this.entryHandlerFactory = EntryHandlerFactory.create().
            contentService( this.contentService ).
            nodeService( this.nodeService ).
            build();
    }

}
