import { Edge } from "@xyflow/react";

export type EdgeData = {
  sourceType: string;
  targetType: string;
  isList: boolean;
};

export type AppEdge = Edge<EdgeData>;
