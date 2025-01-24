import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  Edge,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { defaultInitialNodes, NodeDefinitionId, nodeTypes } from "./nodes";
import { defaultInitialEdges, edgeTypes } from "./edges";
import { RunReportPanel } from "./components/RunReportPanel";
import { useEvent } from "./hooks/use-event";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "./components/ui/context-menu";
import { NewNodeContextMenuContent } from "./components/new-node-context-menu-content";
import { nanoid } from "nanoid";
import { AppNode } from "@/nodes/types";
import { Header } from "@/header";

function Canvas({
  initialNodes,
  initialEdges,
}: {
  initialNodes: AppNode[];
  initialEdges: Edge[];
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const contextMenuElementRef = useRef<HTMLDivElement>(null);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );
  const { screenToFlowPosition } = useReactFlow();
  const handleEdgeClick = useEvent((_: React.MouseEvent, edge: Edge) => {
    setEdges((edges) => edges.filter((e) => e.id !== edge.id));
  });
  const addItem = useEvent((nodeDefId: NodeDefinitionId, name?: string) => {
    const transformText = (
      contextMenuElementRef.current?.parentNode as HTMLElement
    )?.style.transform;
    const [refX, refY] = transformText
      ?.match(/translate\((\d+)px, (\d+)px\)/)
      ?.slice(1, 3)
      .map(Number) || [0, 0];

    setNodes((nodes) => [
      ...nodes,
      {
        id: nanoid(),
        data: {
          label: name,
        },
        type: nodeDefId as AppNode["type"],
        position: screenToFlowPosition({
          x: refX || 0,
          y: refY || 0,
        }),
      } as AppNode,
    ]);
  });

  // I'm not the biggest fan of useEffect, but it's a quick way to persist the nodes and edges to local storage
  useEffect(() => {
    // persist nodes to local storage
    localStorage.setItem("nodes", JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    // persist edges to local storage
    localStorage.setItem("edges", JSON.stringify(edges));
  }, [edges]);

  const nodesWithClassNames = useMemo(() => {
    return nodes.map((n) => ({
      ...n,
      className: "group/node",
    }));
  }, [nodes]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <ReactFlow
          nodes={nodesWithClassNames}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          edges={edges}
          edgeTypes={edgeTypes}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          onEdgeClick={handleEdgeClick}
          snapGrid={[10, 10]}
          panOnScrollSpeed={1.5}
          panOnScroll
        >
          <Background className="bg-stone-100" />
          <Header onRun={() => setIsPanelOpen(true)} />
          <RunReportPanel
            edges={edges}
            nodes={nodes}
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
          />
        </ReactFlow>
      </ContextMenuTrigger>
      <ContextMenuContent ref={contextMenuElementRef}>
        <NewNodeContextMenuContent onSelect={addItem} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function App() {
  const [initialNodes, setInitialNodes] = useState<AppNode[] | null>(null);
  const [initialEdges, setInitialEdges] = useState<Edge[] | null>(null);

  useEffect(() => {
    const nodes = localStorage.getItem("nodes");
    const edges = localStorage.getItem("edges");
    if (nodes && !initialNodes) {
      setInitialNodes(JSON.parse(nodes));
    } else if (!initialNodes) {
      setInitialNodes(defaultInitialNodes);
    }
    if (edges && !initialEdges) {
      setInitialEdges(JSON.parse(edges));
    } else if (!initialEdges) {
      setInitialEdges(defaultInitialEdges);
    }
  }, [initialNodes, initialEdges]);

  return (
    <ReactFlowProvider>
      {initialNodes && initialEdges && (
        <Canvas initialNodes={initialNodes} initialEdges={initialEdges} />
      )}
    </ReactFlowProvider>
  );
}
