import { AppNode, NodeExecutionState } from "@/nodes/types";
import { Flow } from "@/stores/flow-store";

export type NodeCall = {
  nodeId: string;
  sourceId: string;
  targetHandle?: string;
  output: unknown;
};

export type NodeState = {
  pendingCalls: number;
  receivedCalls: NodeCall[];
};

export type FlowContext = {
  flowId: string;
  flows: Flow[];
  openaiKey: string;
  inputs?: Record<string, unknown>;
  onNodeStateChange: (
    nodeId: string,
    state: Partial<NodeExecutionState>
  ) => void;
};

export type NodeExecutor<T extends AppNode = AppNode> = (
  node: T,
  inputs: Record<string, unknown>,
  ctx: FlowContext,
  { log }: { log: (...args: unknown[]) => void }
) => Promise<unknown>;
