import { DefaultNodeForm } from "@/components/default-node-form";
import { AttachmentNodeForm } from "@/components/attachment-node-form";
import { NodeIcon } from "@/components/node-icon";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useDebounce } from "@/hooks/use-debounce";
import { AppNode } from "@/nodes/types";
import { Position, useReactFlow } from "@xyflow/react";
import { useMemo, useState } from "react";
import { useWorkflowExecutionStore } from "@/stores/node-execution-store";
import { LoaderCircle } from "lucide-react";
import { SubflowNodeForm } from "@/components/subflow-node-form";
import { getNodeSourceHandles, getNodeTargetHandles } from "@/nodes";
import { TypedHandles } from "@/components/typed-handles";
import { useFlowStore } from "@/stores/flow-store";
import { MdError } from "react-icons/md";

const NodeFormTypes = {
  attachment: AttachmentNodeForm,
  subflow: SubflowNodeForm,
};

const cxByNodeType = {
  extract: "border-green-600 [&_[data-header]]:bg-green-100",
  attachment: "border-pink-600 [&_[data-header]]:bg-pink-100",
  llm: "border-orange-600 [&_[data-header]]:bg-orange-100",
  subflow: "border-blue-600 [&_[data-header]]:bg-blue-100",
  input: "border-pink-600 [&_[data-header]]:bg-pink-100",
  output: "border-green-600 [&_[data-header]]:bg-green-100",
};

export const TaskNode = (node: AppNode) => {
  const { updateNode, setNodes, setEdges } = useReactFlow();
  const errors = useFlowStore((state) =>
    state.flows
      .find((f) => f.id === state.activeFlowId)
      ?.errors?.filter((e) => e.nodeId === node.id)
  );
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

  const hasErrors = errors && errors?.length !== 0;
  const executionState = useWorkflowExecutionStore(
    (state) => state.nodes[node.id]
  );
  const isRunning = executionState?.isRunning;
  const sourceHandles = useMemo(() => getNodeSourceHandles(node), [node]);
  const targetHandles = useMemo(() => getNodeTargetHandles(node), [node]);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className={`bg-white relative pb-2 data-[state=open]:ring-2 data-[state=open]:ring-stone-950 data-[state=open]:border-stone-950 w-[280px] cursor-default block rounded-md border-2 transition-opacity duration-75 group-[&.dragging_*]/node:!cursor-grabbing ${
          isRunning
            ? "animate-border-path !border-0 !p-0.5  ring-4 ring-green-200"
            : executionState?.error
            ? "!border-0 p-0.5  ring-4 duration-200 transition-all ring-red-500"
            : executionState?.finishedAt
            ? "!border-0 p-0.5  ring-4 duration-200 transition-all ring-green-500"
            : ""
        } ${
          hasErrors
            ? "border-red-500 [&_[data-header]]:bg-red-100"
            : cxByNodeType[node.type as keyof typeof cxByNodeType] ||
              "border-stone-300"
        }`}
      >
        {hasErrors && (
          <MdError className="absolute -right-4 -top-4 h-8 w-8 bg-stone-100 text-red-500 rounded-full" />
        )}
        <TypedHandles
          nodeId={node.id}
          handles={sourceHandles}
          type="source"
          position={Position.Bottom}
        />
        <TypedHandles
          nodeId={node.id}
          handles={targetHandles}
          type="target"
          position={Position.Top}
        />

        {/* {node.type !== "attachment" && (
          <Handle position={Position.Top} type="target" />
        )}
        <Handle position={Position.Bottom} type="source" /> */}
        <header
          data-header
          className="flex items-center rounded-t mb-2 cursor-grab gap-1 text-sm font-medium px-2 py-1.5"
        >
          <NodeIcon node={node} className="w-5 h-5 flex-shrink-0" />
          <input
            value={label}
            className="w-full bg-transparent focus:bg-black/10 focus:outline-none rounded focus:ring-2 px-1.5 focus:ring-black/10"
            placeholder="Untitled"
            onChange={(e) => {
              setLabel(e.target.value);
              syncLabel(e.target.value);
            }}
          />
          {isRunning && (
            <LoaderCircle className="w-4 h-4 animate-spin text-green-600" />
          )}
        </header>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {NodeForm && <NodeForm {...(node as any)} />}
        {!NodeForm && <DefaultNodeForm {...node} />}
        {hasErrors ? (
          <div className="flex flex-col gap-1 px-2">
            {errors.map((error, i) => (
              <div
                key={error.type + String(i)}
                className="text-xs text-red-500 bg-red-50 px-2 py-1.5 rounded"
              >
                <MdError className="inline-block mr-1" />
                {error.message}
              </div>
            ))}
          </div>
        ) : null}
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
