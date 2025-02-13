import { DownloadAsCsvButton } from "@/components/download-as-csv-button";
import { NodeIcon } from "@/components/node-icon";
import { RichText } from "@/components/rich-text";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AppNode } from "@/nodes/types";
import { useFlowStore } from "@/stores/flow-store";
import { useWorkflowExecutionStore } from "@/stores/node-execution-store";
import { ChevronRightIcon, LoaderCircle } from "lucide-react";
import { useMemo } from "react";
import { MdCheckCircle, MdError } from "react-icons/md";

export function RunReportNodes() {
  const { nodes, edges } = useFlowStore(
    (s) => s.flows.find((f) => f.id === s.activeFlowId) || s.flows[0]
  );
  const nodeStates = useWorkflowExecutionStore((state) => state.nodes);
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
    <div className="p-4 overflow-auto h-full pb-48">
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
              {state.finishedAt && !state.error && (
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
              {state.output ? <Output output={state.output} /> : null}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

const Output = ({ output }: { output: unknown }) => {
  if (typeof output === "string") {
    return (
      <RichText
        className="rounded-md text-sm whitespace-pre-wrap"
        proseClassName="prose prose-sm"
      >
        {output}
      </RichText>
    );
  }

  if (
    Array.isArray(output) &&
    typeof output[0] === "object" &&
    !Array.isArray(output[0])
  ) {
    const keys = Object.keys(output[0]);

    return (
      <div className="prose prose-sm overflow-x-scroll from-stone-100 to-green-50 bg-gradient-to-tl -mx-2 rounded-lg p-2">
        <table>
          <thead>
            <tr>
              {keys.map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {output.map((row, i) => (
              <tr key={JSON.stringify(row) + i}>
                {keys.map((key) => (
                  <td key={key} className="text-left">
                    {row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mb-2">
          <DownloadAsCsvButton data={output} />
        </div>
      </div>
    );
  }

  if (typeof output === "object" && output) {
    const keys = Object.keys(output);
    return (
      <div className="prose prose-sm overflow-x-scroll from-stone-100 to-green-50 bg-gradient-to-tl -mx-2 rounded-lg p-2">
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{output[key as keyof typeof output]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mb-2">
          <DownloadAsCsvButton data={output} />
        </div>
      </div>
    );
  }

  return <pre className="bg-stone-100">{JSON.stringify(output, null, 2)}</pre>;
};
