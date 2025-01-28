import { create } from "zustand";
import { AppNode } from "@/nodes/types";
import { Edge } from "@xyflow/react";
import { nanoid } from "nanoid";
import { persist } from "zustand/middleware";

export type Flow = {
  id: string;
  name: string;
  nodes: AppNode[];
  edges: Edge[];
};

interface FlowStore {
  flows: Flow[];
  activeFlowId: string | null;
  addFlow: (name: string, nodes?: AppNode[], edges?: Edge[]) => string;
  updateFlow: (id: string, flow: Partial<Flow>) => void;
  setActiveFlow: (id: string) => void;
  getFlow: (id: string) => Flow | undefined;
}

export const useFlowStore = create<FlowStore>(
  persist(
    (set, get) => ({
      flows: [],
      activeFlowId: null,

      addFlow: (name, nodes = [], edges = []) => {
        const id = nanoid();
        set((state) => ({
          flows: [...state.flows, { id, name, nodes, edges }],
          activeFlowId: state.activeFlowId || id,
        }));
        return id;
      },

      updateFlow: (id, flow) => {
        set((state) => ({
          flows: state.flows.map((f) => (f.id === id ? { ...f, ...flow } : f)),
        }));
      },

      setActiveFlow: (id) => {
        set({ activeFlowId: id });
      },

      getFlow: (id) => {
        return get().flows.find((f) => f.id === id);
      },
    }),
    {
      name: "flow-store",
    }
  )
);
