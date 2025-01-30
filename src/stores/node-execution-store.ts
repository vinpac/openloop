import { NodeExecutionState, NodeExecutionStore } from "@/nodes/types";
import { z } from "zod";
import { create } from "zustand";

interface State {
  inputSchema?: z.ZodObject<Record<string, z.ZodType<unknown>>>;
  input?: Record<string, unknown>;
  nodes: NodeExecutionStore;
  setNodeState: (
    nodeId: string,
    stateFn: (prev: NodeExecutionState) => NodeExecutionState
  ) => void;
  clearAllStates: () => void;
}

export const useWorkflowExecutionStore = create<State>((set) => ({
  nodes: {},
  setNodeState: (nodeId, stateFn) =>
    set((prev) => ({
      nodes: {
        ...prev.nodes,
        [nodeId]: stateFn(prev.nodes[nodeId]),
      },
    })),
  clearAllStates: () => set({ nodes: {} }),
}));

export type WorkflowExecutionStoreState = State;
