import type { NodeTypes } from "@xyflow/react";

import { AppNode } from "./types";
import { z } from "zod";
import { RootNode } from "@/components/root-node";
import { zField } from "@/components/zod-form/helpers";
import defaultFlow from "@/default-flow.json";

export const defaultInitialNodes = defaultFlow.nodes as AppNode[];

type NodeDefinition = {
  id: AppNode["type"];
  name: string;
  description: string;
  input: z.ZodObject<z.ZodRawShape, z.UnknownKeysParam, z.ZodTypeAny, object>;
};

export type NodeDefinitionId = NodeDefinition["id"];

const model = zField(z.enum(["gpt-4o", "gpt-4o-mini"]), {
  label: "Model",
  placeholder: "Select a model to run",
});
export const NODE_DEFINITIONS: NodeDefinition[] = [
  {
    id: "file-input",
    name: "File Input",
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
];

export const nodeTypes = Object.fromEntries(
  NODE_DEFINITIONS.map((nodeDefinition) => [
    nodeDefinition.id as AppNode["id"],
    RootNode,
  ])

  // forcing the type here to route all nodes to RootNode since I only have task nodes with the same format (header + form)
) as unknown as NodeTypes;
