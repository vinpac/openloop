import { AttachedFile } from "@/components/file-input";
import type { Node, BuiltInNode } from "@xyflow/react";

export type InputNode = Node<
  {
    label: string;
    type: "file" | "text" | "number" | "date" | "boolean";
    isList: boolean;
  },
  "input"
>;
export type OutputNode = Node<
  {
    label: string;
    type: "file" | "text" | "number" | "date" | "boolean";
    isList: boolean;
  },
  "output"
>;
export type AttachmentNode = Node<
  {
    label: string;
    file?: AttachedFile;
  },
  "attachment"
>;

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
    prompt?: string;
    model?: string;
  },
  "extract"
>;

export type TextNode = Node<
  {
    content?: string;
    label?: string;
  },
  "text"
>;

export type SubflowNode = Node<
  {
    flowId: string;
    label?: string;
  },
  "subflow"
>;

export type AppNode =
  | BuiltInNode
  | AttachmentNode
  | LLMNode
  | ExtractNode
  | TextNode
  | SubflowNode
  | InputNode;

export type NodeExecutionState = {
  isRunning: boolean;
  output?: unknown;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
  flowId: string;
};

export type NodeExecutionStore = Record<string, NodeExecutionState>;
