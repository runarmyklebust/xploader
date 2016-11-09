package com.enonic.xp.loader.entryhandler;

import java.util.Map;

import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.loader.PropertyTreeFactory;
import com.enonic.xp.loader.format.Format;
import com.enonic.xp.loader.tool.NodeNameFactory;
import com.enonic.xp.node.CreateNodeParams;
import com.enonic.xp.node.Node;
import com.enonic.xp.node.NodePath;
import com.enonic.xp.node.NodeService;

public class NodeEntryHandler
    implements EntryHandler
{
    private final NodeService nodeService;

    private final Format format;

    private int total = 0;

    public NodeEntryHandler( final NodeService nodeService, final Format format )
    {
        this.nodeService = nodeService;
        this.format = format;
    }

    @Override
    public void handle( final Map<String, String> values )
    {
        final PropertyTree data = PropertyTreeFactory.create( format, values );
        final NodePath parentPath = NodePath.ROOT;
        final String nodeName = NodeNameFactory.create( this.format, values );

        final NodePath newNodePath = NodePath.create( parentPath, nodeName ).build();

        if ( this.nodeService.nodeExists( newNodePath ) )
        {
            System.out.println( "Node exists already: [" + newNodePath + "]" );
            return;
        }

        final Node node = this.nodeService.create( CreateNodeParams.create().
            name( nodeName ).
            parent( parentPath ).
            data( data ).
            build() );

        total++;
    }

    @Override
    public String getName()
    {
        return "node";
    }

    public int getTotal()
    {
        return total;
    }
}
