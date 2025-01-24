import { NodeIcon } from "@/components/node-icon";
import { RichText } from "@/components/rich-text";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AppNode } from "@/nodes/types";
import { useNodeExecutionStore } from "@/stores/node-execution-store";
import { Edge } from "@xyflow/react";
import { ChevronRightIcon, LoaderCircle } from "lucide-react";
import { useMemo } from "react";
import { MdCheckCircle, MdError } from "react-icons/md";

interface RunReportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  edges: Edge[];
  nodes: AppNode[];
}

export function RunReportPanel({
  isOpen,
  onClose,
  edges,
  nodes,
}: RunReportPanelProps) {
  const nodeStates = useNodeExecutionStore((state) => state.nodes);
  const outputNodesIds = useMemo(() => {
    // return the nodes that have no outgoing edges
    const sourceEdgeCount: Map<string, number> = new Map();
    edges.forEach((edge) => {
      sourceEdgeCount.set(
        edge.source,
        (sourceEdgeCount.get(edge.source) || 0) + 1
      );
    });

    return nodes
      .filter((node) => !sourceEdgeCount.get(node.id))
      .map((node) => node.id);
  }, [edges, nodes]);
  const sortedNodes = useMemo(
    () =>
      nodes.sort((a, b) => {
        const aStartedAt = nodeStates[a.id]?.startedAt;
        const bStartedAt = nodeStates[b.id]?.startedAt;

        if (!bStartedAt) return -Infinity;
        if (!aStartedAt) return Infinity;

        return aStartedAt - bStartedAt;
      }),
    [nodes, nodeStates]
  );

  return (
    <div
      className={`fixed top-14 bottom-0 right-0 w-96 bg-white border-l border-stone-200 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } z-40`}
    >
      <div className="flex justify-between items-center py-1 pl-3 pr-1 border-b">
        <h2 className="text-sm uppercase font-bold">Run Report</h2>
        <Button variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </div>
      <div className="p-4 overflow-auto h-[calc(90vh-4rem)]">
        {sortedNodes.map((node) => {
          const state = nodeStates[node.id];
          if (!state) return null;

          return (
            <Collapsible
              key={node.id}
              className="mb-4 last:mb-0"
              defaultOpen={outputNodesIds.includes(node.id)}
            >
              <CollapsibleTrigger className="flex items-center gap-2 mb-2 group/trigger">
                <ChevronRightIcon className="w-4 h-4 transform duration-200 group-data-[state=open]/trigger:rotate-90" />

                <NodeIcon node={node as AppNode} />
                <h3 className="font-medium">
                  {(node.data as unknown as { label?: string }).label ||
                    node.type}
                </h3>
                {state.error && <MdError className="text-red-500" />}
                {state.finishedAt && (
                  <MdCheckCircle className="text-green-500" />
                )}
                {state.finishedAt && state.startedAt && (
                  <span className="text-xs text-stone-500">
                    after {state.finishedAt - state.startedAt}ms
                  </span>
                )}
                {state.isRunning && (
                  <LoaderCircle className="w-6 h-6 animate-spin text-green-600" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                {state.error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {state.error}
                  </div>
                )}
                {state.output && (
                  <RichText
                    className="rounded-md text-sm whitespace-pre-wrap"
                    proseClassName="prose prose-sm"
                  >
                    {state.output}
                  </RichText>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
