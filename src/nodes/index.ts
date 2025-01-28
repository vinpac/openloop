import type { NodeTypes } from "@xyflow/react";

import { AppNode } from "./types";
import { z } from "zod";
import { TaskNode } from "@/components/task-node";
import { zField } from "@/components/zod-form/helpers";
import defaultFlow from "@/default-flow.json";
import { TextNode } from "@/components/text-node";
import { SubflowNode } from "@/components/subflow-node";

export const defaultInitialNodes = defaultFlow.nodes as AppNode[];

type NodeDefinition = {
  id: AppNode["type"];
  name: string;
  description: string;
  input: z.ZodObject<z.ZodRawShape, z.UnknownKeysParam, z.ZodTypeAny, object>;
  executable?: boolean;
};

export type NodeDefinitionId = NodeDefinition["id"];

const model = zField(z.enum(["gpt-4o", "gpt-4o-mini"]), {
  label: "Model",
  placeholder: "Select a model to run",
});
export const NODE_DEFINITIONS: NodeDefinition[] = [
  {
    id: "text",
    name: "Text",
    description: "A simple text node for adding notes or documentation",
    input: z.object({}),
    executable: false,
  },
  {
    id: "attachment",
    name: "Attachment",
    description: "Accepts PDFs and Text Files",
    input: z.object({}),
  },
  {
    id: "llm",
    name: "LLM",
    input: z.object({
      prompt: zField(z.string(), {
        label: "Prompt",
        placeholder: "Write your prompt here",
        minRows: 4,
      }),
      model,
    }),
    description:
      "Use an open AI model to generate text. It receives the previous node's output.",
  },
  {
    id: "extract",
    name: "Extract Data",
    input: z.object({
      model,
      isList: zField(z.boolean().default(true), {
        label: "Is List",
        placeholder: "Is the data a list?",
      }),
      prompt: zField(z.string(), {
        label: "Prompt",
        placeholder: "Write your prompt here",
        minRows: 4,
      }),
      fields: zField(
        z.array(
          z.object({
            name: z.string(),
            type: z.enum(["text", "number", "date", "boolean"]),
            description: z.string(),
            required: z.boolean().optional(),
          })
        ),
        {
          label: "Fields",
          placeholder: "Select fields to extract",
        }
      ),
    }),
    description: "Extracts data from the previous node's output.",
  },
  {
    id: "subflow",
    name: "Subflow",
    description: "A node that represents another flow",
    input: z.object({
      flowId: zField(z.string(), {
        label: "Flow ID",
        placeholder: "Enter flow ID",
      }),
    }),
  },
  {
    id: "input",
    name: "Input",
    description: "An input node",
    input: z.object({
      label: zField(z.string(), {
        label: "Label",
        placeholder: "Enter a label",
      }),
      type: zField(z.enum(["file", "text", "number", "date", "boolean"]), {
        label: "Type",
        placeholder: "Select a type",
      }),
      isList: zField(z.boolean().default(false), {
        label: "Is List",
        placeholder: "Is the data a list?",
      }),
    }),
  },
  {
    id: "output",
    name: "Output",
    description: "An output node",
    input: z.object({
      label: zField(z.string(), {
        label: "Label",
        placeholder: "Enter a label",
      }),
      type: zField(z.enum(["file", "text", "number", "date", "boolean"]), {
        label: "Type",
        placeholder: "Select a type",
      }),
      isList: zField(z.boolean().default(false), {
        label: "Is List",
        placeholder: "Is the data a list?",
      }),
    }),
  },
];

export const nodeTypes = {
  ...Object.fromEntries(
    NODE_DEFINITIONS.map((nodeDefinition) => [
      nodeDefinition.id as AppNode["id"],
      TaskNode,
    ])
  ),

  // override
  text: TextNode,
} as unknown as NodeTypes;

export const nodeDefinitionById = Object.fromEntries(
  NODE_DEFINITIONS.map((nodeDefinition) => [nodeDefinition.id, nodeDefinition])
);
