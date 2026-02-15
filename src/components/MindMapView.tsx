import { useState, useCallback } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { Button } from "@/components/ui/button";
import { Msg, generateMindMapData } from "@/lib/streamChat";
import { toast } from "sonner";

interface MindMapViewProps {
  messages: Msg[];
  personaColor: string;
}

const nodeWidth = 180;
const nodeHeight = 60;

function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 80 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 },
    };
  });
}

const MindMapView = ({ messages, personaColor }: MindMapViewProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (messages.length < 2) {
      toast.error("Have a conversation first before generating a mind map.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await generateMindMapData(messages);

      const flowNodes: Node[] = [];
      const flowEdges: Edge[] = [];

      // Root node
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

      // Branches and leaves
      data.branches.forEach((branch) => {
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
        flowEdges.push({
          id: `e-${branch.parentId}-${branch.id}`,
          source: branch.parentId,
          target: branch.id,
          style: { stroke: "hsl(25, 25%, 35%)", strokeWidth: 2 },
        });

        branch.children?.forEach((child) => {
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
          flowEdges.push({
            id: `e-${child.parentId}-${child.id}`,
            source: child.parentId,
            target: child.id,
            style: { stroke: "hsl(25, 25%, 35%, 0.5)", strokeWidth: 1 },
          });
        });
      });

      const laidOut = layoutNodes(flowNodes, flowEdges);
      setNodes(laidOut);
      setEdges(flowEdges);
      setGenerated(true);
    } catch (err) {
      console.error("Mind map generation error:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to generate mind map: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  }, [messages, personaColor, setNodes, setEdges]);

  if (!generated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="pixel-border bg-card/80 backdrop-blur-sm px-8 py-6 text-center">
          <h2 className="font-pixel text-xs text-primary mb-3">Mind Map</h2>
          <p className="font-retro text-lg text-muted-foreground mb-4">
            Visualize the themes and insights from your conversation.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || messages.length < 2}
            className="font-retro text-lg px-6"
          >
            {isLoading ? "Generating..." : "Generate Mind Map"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="hsl(25, 25%, 35%, 0.1)" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default MindMapView;
