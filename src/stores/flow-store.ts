import { create } from "zustand";
import { AppNode } from "@/nodes/types";
import { Edge } from "@xyflow/react";
import { nanoid } from "nanoid";
import { persist, PersistOptions } from "zustand/middleware";
import { getNodeSourceHandles, getNodeTargetHandles } from "@/nodes";
import { StateCreator } from "zustand";

export type Flow = {
  id: string;
  name: string;
  nodes: AppNode[];
  edges: Edge[];
  errors?: FlowError[];
};

type FlowError = {
  nodeId: string;
  message: string;
  type: "type_mismatch" | "multiple_connections" | "invalid_type";
};

interface FlowStore {
  flows: Flow[];
  activeFlowId: string | null;
  addFlow: (name: string, nodes?: AppNode[], edges?: Edge[]) => string;
  updateFlow: (id: string, flow: Partial<Flow>) => void;
  setActiveFlow: (id: string) => void;
  removeFlow: (id: string) => void;
  getFlow: (id: string) => Flow | undefined;
}

type FlowPersist = (
  config: StateCreator<FlowStore>,
  options: PersistOptions<FlowStore>
) => StateCreator<FlowStore>;

export const useFlowStore = create<FlowStore>(
  (persist as FlowPersist)(
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
          flows: state.flows.map((f) => {
            if (f.id === id) {
              const next = {
                ...f,
                ...flow,
              };

              if (flow.nodes || flow.edges) {
                next.errors = evaluateFlowErrors(next);
              }

              return next;
            }

            return f;
          }),
        }));
      },

      setActiveFlow: (id) => {
        set({ activeFlowId: id });
      },

      getFlow: (id) => {
        return get().flows.find((f) => f.id === id);
      },

      removeFlow: (id) => {
        set((state) => ({
          flows: state.flows.filter((f) => f.id !== id),
        }));
      },
    }),
    {
      name: "flow-store",
    }
  )
);

function evaluateFlowErrors(flow: Flow): FlowError[] {
  const errors: FlowError[] = [];
  const { nodes, edges } = flow;

  // Create a map of target nodes to their incoming edges
  const targetEdgesMap = new Map<string, Edge[]>();
  edges.forEach((edge) => {
    const existingEdges = targetEdgesMap.get(edge.target) || [];
    targetEdgesMap.set(edge.target, [...existingEdges, edge]);
  });

  // Check each node that has incoming edges
  targetEdgesMap.forEach((incomingEdges, targetNodeId) => {
    const targetNode = nodes.find((n) => n.id === targetNodeId) as AppNode;
    if (!targetNode) return;

    const targetHandles = getNodeTargetHandles(targetNode);
    if (!targetHandles.length) return;

    // Group edges by their target handle
    const edgesByHandle = new Map<string | null | undefined, Edge[]>();
    incomingEdges.forEach((edge) => {
      const existingEdges =
        edgesByHandle.get(edge.targetHandle ?? undefined) || [];
      edgesByHandle.set(edge.targetHandle ?? undefined, [
        ...existingEdges,
        edge,
      ]);
    });

    // Check each handle's connections
    edgesByHandle.forEach((handleEdges, handleId) => {
      // Find the corresponding handle definition
      const targetHandle =
        handleId != null
          ? targetHandles.find((h) => h.id === handleId)
          : targetHandles[0]; // Default to first handle if no handle ID (backward compatibility)

      if (!targetHandle) return;

      // Case 1: Check for multiple connections to non-array handles
      if (handleEdges.length > 1 && !targetHandle.isList) {
        const handleLabel =
          targetHandle.label || targetHandle.id || "unnamed handle";
        errors.push({
          nodeId: targetNodeId,
          message: `Handle ${handleLabel} expects a single ${
            "types" in targetHandle ? targetHandle.types[0] : targetHandle.type
          } but has ${handleEdges.length} incoming connections`,
          type: "multiple_connections",
        });
        return;
      }

      // Case 2: Check type compatibility for each incoming edge
      handleEdges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source) as AppNode;
        if (!sourceNode) return;

        const sourceHandles = getNodeSourceHandles(sourceNode);
        const sourceHandle =
          edge.sourceHandle != null
            ? sourceHandles.find((h) => h.id === edge.sourceHandle)
            : sourceHandles[0]; // Default to first handle if no handle ID

        if (!sourceHandle) return;

        // Check if types are compatible
        const isUnionTypeMatch =
          "types" in targetHandle &&
          targetHandle.types?.some((t) => t === sourceHandle.type);

        const targetType =
          "types" in targetHandle ? targetHandle.types[0] : targetHandle.type;
        const isTypeCompatible =
          sourceHandle.type === targetType ||
          targetType === "any" ||
          ("types" in targetHandle &&
            targetHandle.types.some((t) => t === sourceHandle.type)) ||
          isUnionTypeMatch;

        if (!isTypeCompatible) {
          const handleLabel =
            targetHandle.label || targetHandle.id || "unnamed handle";
          errors.push({
            nodeId: targetNodeId,
            message: `Type mismatch at handle ${handleLabel}: Source outputs ${
              sourceHandle.type
            }${sourceHandle.isList ? "[]" : ""} but target expects ${
              "types" in targetHandle
                ? targetHandle.types.join(" | ")
                : targetHandle.type
            }${targetHandle.isList ? "[]" : ""}`,
            type: "type_mismatch",
          });
        }

        // Check if array/non-array types are compatible
        if (!targetHandle.isList && sourceHandle.isList) {
          const handleLabel =
            targetHandle.label || targetHandle.id || "unnamed handle";
          errors.push({
            nodeId: targetNodeId,
            message: `Array type mismatch at handle ${handleLabel}: Source outputs array but target expects single value`,
            type: "type_mismatch",
          });
        }
      });
    });
  });

  return errors;
}
