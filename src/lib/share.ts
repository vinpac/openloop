import { AppNode } from "@/nodes/types";
import { Edge } from "@xyflow/react";

export function serializeWorkflow(nodes: AppNode[], edges: Edge[]): string {
  const state = {
    nodes,
    edges,
  };
  return encodeURIComponent(btoa(JSON.stringify(state)));
}

export function deserializeWorkflow(data: string): {
  nodes: AppNode[];
  edges: Edge[];
} {
  try {
    const decoded = JSON.parse(atob(decodeURIComponent(data)));
    return {
      nodes: decoded.nodes,
      edges: decoded.edges,
    };
  } catch (e) {
    console.error("Failed to deserialize workflow:", e);
    throw new Error("Invalid workflow data");
  }
}
