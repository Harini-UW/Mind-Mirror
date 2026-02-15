// bring in state tracking tools
import { useState, useCallback } from "react";
// bring in mind map display tools
import {
  ReactFlow,
  Node,
  Edge,
  Background,
} from "@xyflow/react";
// bring in mind map styles
import "@xyflow/react/dist/style.css";
// bring in layout arranging tool
import dagre from "dagre";
// bring in button component
import { Button } from "@/components/ui/button";
// bring in ai mind map maker
import { Msg, generateMindMapData } from "@/lib/streamChat";
// bring in popup message tool
import { toast } from "sonner";

// what this view needs to work
interface MindMapViewProps {
  messages: Msg[];       // all chat messages
  personaColor: string;  // color for boxes
}

// how big each box should be
const nodeWidth = 180;
const nodeHeight = 60;

// arrange boxes in tree shape
function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  // make new layout calculator
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  // arrange top to bottom with spacing
  g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 80 });

  // tell calculator about each box
  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  // tell calculator about connections
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // calculate positions
  dagre.layout(g);

  // put boxes in calculated spots
  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 },
    };
  });
}

// page showing mind map diagram
const MindMapView = ({ messages, personaColor }: MindMapViewProps) => {
  // remember all boxes
  const [nodes, setNodes] = useState<Node[]>([]);
  // remember all connections
  const [edges, setEdges] = useState<Edge[]>([]);
  // remember if ai is thinking
  const [isLoading, setIsLoading] = useState(false);
  // remember if map is created
  const [generated, setGenerated] = useState(false);
  // remember if error happened
  const [error, setError] = useState<string | null>(null);

  // make mind map from chat messages
  const handleGenerate = useCallback(async () => {
    // stop if not enough messages
    if (messages.length < 2) {
      toast.error("Have a conversation first before generating a mind map.");
      return;
    }

    console.log("Starting mind map generation...");
    // show thinking state
    setIsLoading(true);
    // clear old errors
    setError(null);

    try {
      console.log("Calling generateMindMapData with", messages.length, "messages");
      // ask ai to make map data
      const data = await generateMindMapData(messages);
      console.log("Mind map data received:", data);

      // prepare box and line lists
      const flowNodes: Node[] = [];
      const flowEdges: Edge[] = [];

      // make center box at top
      flowNodes.push({
        id: data.rootNode.id,
        data: { label: data.rootNode.label },
        position: { x: 0, y: 0 },
        style: {
          background: "hsl(25, 30%, 18%)",
          color: "hsl(40, 50%, 95%)",
          border: "3px solid hsl(25, 25%, 35%)",
          fontFamily: "'Press Start 2P', cursive",
          fontSize: "8px",
          padding: "12px",
          width: nodeWidth,
          borderRadius: "0px",
        },
      });

      // make boxes for main topics
      data.branches.forEach((branch) => {
        // add topic box in character color
        flowNodes.push({
          id: branch.id,
          data: { label: branch.label },
          position: { x: 0, y: 0 },
          style: {
            background: personaColor,
            color: "hsl(40, 50%, 95%)",
            border: "3px solid hsl(25, 25%, 35%)",
            fontFamily: "'VT323', monospace",
            fontSize: "14px",
            padding: "8px",
            width: nodeWidth,
            borderRadius: "0px",
          },
        });
        // connect topic to center box
        flowEdges.push({
          id: `e-${branch.parentId}-${branch.id}`,
          source: branch.parentId,
          target: branch.id,
          style: { stroke: "hsl(25, 25%, 35%)", strokeWidth: 2 },
        });

        // make boxes for details
        branch.children?.forEach((child) => {
          // add detail box in light color
          flowNodes.push({
            id: child.id,
            data: { label: child.label },
            position: { x: 0, y: 0 },
            style: {
              background: "hsl(40, 45%, 92%)",
              color: "hsl(25, 30%, 18%)",
              border: "2px solid hsl(25, 25%, 35%)",
              fontFamily: "'VT323', monospace",
              fontSize: "14px",
              padding: "8px",
              width: nodeWidth,
              borderRadius: "0px",
            },
          });
          // connect detail to topic box
          flowEdges.push({
            id: `e-${child.parentId}-${child.id}`,
            source: child.parentId,
            target: child.id,
            style: { stroke: "hsl(25, 25%, 35%, 0.5)", strokeWidth: 1 },
          });
        });
      });

      // arrange boxes in tree shape
      const laidOut = layoutNodes(flowNodes, flowEdges);
      // save all boxes
      setNodes(laidOut);
      // save all connections
      setEdges(flowEdges);
      // mark as complete
      setGenerated(true);
    } catch (err) {
      console.error("Mind map generation error:", err);
      // save error message
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      // show error to user
      toast.error(`Failed to generate mind map: ${errorMsg}`, {
        duration: 5000,
      });
    } finally {
      // hide thinking state
      setIsLoading(false);
      console.log("Mind map generation finished, isLoading set to false");
    }
  }, [messages, personaColor]);

  // show button if not generated yet
  if (!generated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="pixel-border bg-card/80 backdrop-blur-sm px-8 py-6 text-center max-w-md">
          <h2 className="font-pixel text-xs text-primary mb-3">Mind Map</h2>
          <p className="font-retro text-lg text-muted-foreground mb-4">
            Visualize the themes and insights from your conversation.
          </p>
          {/* show error box if failed */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border-2 border-red-700 text-red-400 font-retro text-sm">
              <p className="font-semibold mb-1">Error:</p>
              <p>{error}</p>
            </div>
          )}
          <Button
            onClick={handleGenerate}
            disabled={isLoading || messages.length < 2}
            className="font-retro text-lg px-6"
          >
            {isLoading ? "Generating..." : error ? "Try Again" : "Generate Mind Map"}
          </Button>
        </div>
      </div>
    );
  }

  // show mind map diagram
  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="hsl(25, 25%, 35%, 0.1)" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default MindMapView;
