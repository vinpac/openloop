import type { Edge, EdgeTypes } from "@xyflow/react";
import { DefaultEdge } from "./default-edge";
import defaultFlow from "@/default-flow.json";

export const defaultInitialEdges = defaultFlow.edges as Edge[];

export const edgeTypes = {
  // Add your custom edge types here!
  default: DefaultEdge,
} satisfies EdgeTypes;
