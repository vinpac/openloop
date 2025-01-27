import { AppNode, NodeExecutionState } from "@/nodes/types";
import { Node, Edge } from "@xyflow/react";

export type NodeCall = {
  nodeId: string;
  sourceId: string;
  output: unknown;
};

export type NodeState = {
  pendingCalls: number;
  receivedCalls: NodeCall[];
};

export type Context = {
  openaiKey: string;
};
export type WorkflowInput = {
  nodes: Node[];
  edges: Edge[];
  ctx: Context;
  onNodeStateChange: (
    nodeId: string,
    state: Partial<NodeExecutionState>
  ) => void;
};

export type WorkflowExecutor<T extends AppNode = AppNode> = (
  node: T,
  inputs: unknown[],
  workflowInput: WorkflowInput,
  { log }: { log: (...args: unknown[]) => void }
) => Promise<unknown>;
