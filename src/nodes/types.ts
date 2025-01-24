import type { Node, BuiltInNode } from "@xyflow/react";

export type FileInputNode = Node<
  {
    label: string;
    file?: NodeFile;
  },
  "file-input"
>;

type NodeFile = {
  name: string;
  size: number;
  type: string;
  content: string;
};

export type LLMNode = Node<
  {
    prompt: string;
    model: string;
    label: string;
  },
  "llm"
>;

export type ExtractNode = Node<
  {
    fields: Array<{
      name: string;
      type: string;
      description: string;
      required?: boolean;
    }>;
    label: string;
    isList: boolean;
  },
  "extract"
>;

export type AppNode = BuiltInNode | FileInputNode | LLMNode | ExtractNode;

export type NodeExecutionState = {
  isRunning: boolean;
  output?: string;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
};

export type NodeExecutionStore = Record<string, NodeExecutionState>;
