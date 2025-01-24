import { NodeExecutionState, NodeExecutionStore } from "@/nodes/types";
import { create } from "zustand";

interface State {
  nodes: NodeExecutionStore;
  setNodeState: (
    nodeId: string,
    stateFn: (prev: NodeExecutionState) => NodeExecutionState
  ) => void;
  clearAllStates: () => void;
}

export const useNodeExecutionStore = create<State>((set) => ({
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

export type NodeExecutionStoreState = State;
