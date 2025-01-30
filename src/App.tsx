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
import { Toaster } from "react-hot-toast";
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
import { deserializeWorkflow } from "@/lib/share";
import { useFlowStore, Flow } from "./stores/flow-store";
import { FlowSelector } from "@/components/flow-selector";

function Canvas({ flow }: { flow: Flow }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(flow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow?.edges || []);
  const contextMenuElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useFlowStore.getState().updateFlow(flow.id, {
      nodes,
      edges,
    });
  }, [nodes, edges, flow.id]);

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
        </ReactFlow>
      </ContextMenuTrigger>
      <ContextMenuContent ref={contextMenuElementRef}>
        <NewNodeContextMenuContent onSelect={addItem} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const flow = useFlowStore((state) =>
    state.flows.find((f) => f.id === state.activeFlowId)
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    // Try to load workflow from URL parameters first
    const params = new URLSearchParams(window.location.search);
    const flowData = params.get("flow");

    if (useFlowStore.getState().flows.length > 0) {
      setIsLoading(false);
      return;
    }

    if (flowData) {
      try {
        const flows = deserializeWorkflow(flowData);
        useFlowStore.setState({ flows, activeFlowId: flows[0].id });
      } catch (e) {
        console.error("Failed to load workflow from URL:", e);
      }
    } else {
      // Create default flow
      const flow: Flow = {
        id: nanoid(),
        name: "Main Flow",
        nodes: defaultInitialNodes,
        edges: defaultInitialEdges,
      };
      useFlowStore.setState({
        flows: [flow],
        activeFlowId: flow.id,
      });
    }

    setIsLoading(false);
  }, []);

  if (isLoading) return null;

  return (
    <ReactFlowProvider>
      <Header onRun={() => setIsPanelOpen(true)} />
      <FlowSelector />

      {flow && <Canvas key={flow.id} flow={flow} />}
      {flow && (
        <RunReportPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          flow={flow}
        />
      )}
      <Toaster />
    </ReactFlowProvider>
  );
}
