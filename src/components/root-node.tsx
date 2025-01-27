import { DefaultNodeForm } from "@/components/default-node-form";
import { FileInputNodeForm } from "@/components/file-input-node-form";
import { NodeIcon } from "@/components/node-icon";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useDebounce } from "@/hooks/use-debounce";
import { AppNode } from "@/nodes/types";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { useNodeExecutionStore } from "@/stores/node-execution-store";
import { LoaderCircle } from "lucide-react";

const NodeFormTypes = {
  "file-input": FileInputNodeForm,
};

export const RootNode = (node: AppNode) => {
  const { updateNode, setNodes, setEdges } = useReactFlow();
  const NodeForm = NodeFormTypes[node.type as keyof typeof NodeFormTypes];
  const [label, setLabel] = useState(
    (node.data as { label?: string }).label || node.type
  );
  const syncLabel = useDebounce((newLabel) => {
    updateNode(node.id, { data: { ...node.data, label: newLabel } });
  }, 200);

  const deleteNode = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== node.id));
    setEdges((edges) =>
      edges.filter((e) => e.source !== node.id && e.target !== node.id)
    );
  };

  const executionState = useNodeExecutionStore((state) => state.nodes[node.id]);
  const isRunning = executionState?.isRunning;

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className={`bg-white relative data-[state=open]:ring-2 data-[state=open]:ring-stone-950 data-[state=open]:border-stone-950 w-[280px] cursor-default block rounded-md border-2 border-stone-300 transition-opacity duration-75 group-[&.dragging_*]/node:!cursor-grabbing ${
          isRunning
            ? "animate-border-path !border-0 !p-0.5 ring-inset ring-4 ring-green-200"
            : executionState?.error
            ? "!border-0 p-0.5 ring-inset ring-4 duration-200 transition-all ring-red-500"
            : executionState?.finishedAt
            ? "!border-0 p-0.5 ring-inset ring-4 duration-200 transition-all ring-green-500"
            : ""
        }`}
      >
        {node.type !== "file-input" && (
          <Handle position={Position.Top} type="target" />
        )}
        <Handle position={Position.Bottom} type="source" />
        <header className="flex items-center cursor-grab gap-1 text-sm font-medium px-2 py-1.5">
          <NodeIcon node={node} className="w-5 h-5 flex-shrink-0" />
          <input
            value={label}
            className="w-full bg-transparent focus:bg-stone-100 focus:outline-none rounded focus:ring-2 px-1.5 focus:ring-stone-100"
            onChange={(e) => {
              setLabel(e.target.value);
              syncLabel(e.target.value);
            }}
          />
          {isRunning && (
            <LoaderCircle className="w-4 h-4 animate-spin text-green-600" />
          )}
        </header>
        {NodeForm && <NodeForm {...node} />}
        {!NodeForm && <DefaultNodeForm {...node} />}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem asChild>
          <button className="w-full cursor-pointer" onClick={deleteNode}>
            Delete
          </button>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
