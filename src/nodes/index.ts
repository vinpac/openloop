import type { NodeTypes } from "@xyflow/react";

import {
  AppNode,
  InputNode,
  OutputNode,
  SubflowNode,
  JavaScriptNode,
} from "./types";
import { z } from "zod";
import { TaskNode } from "@/components/task-node";
import { zField } from "@/components/zod-form/helpers";
import defaultFlow from "@/default-flow.json";
import { TextNode } from "@/components/text-node";

import { useFlowStore } from "@/stores/flow-store";

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
      type: zField(
        z.enum(["file", "text", "number", "date", "boolean", "dictionary"]),
        {
          label: "Type",
          placeholder: "Select a type",
        }
      ),
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
      type: zField(
        z.enum(["file", "text", "number", "date", "boolean", "dictionary"]),
        {
          label: "Type",
          placeholder: "Select a type",
        }
      ),
      isList: zField(z.boolean().default(false), {
        label: "Is List",
        placeholder: "Is the data a list?",
      }),
    }),
  },
  {
    id: "javascript",
    name: "JavaScript",
    description:
      "Execute custom JavaScript code with inputs and produce an output",
    input: z.object({
      code: zField(z.string(), {
        label: "Code",
        placeholder: "Write your JavaScript code here",
        minRows: 4,
      }),

      inputs: zField(
        z.array(
          z.object({
            name: z.string(),
            type: z.enum(["text", "number", "date", "boolean", "dictionary"]),
            isList: z.boolean().default(false),
          })
        ),
        {
          label: "Inputs",
          placeholder: "Add inputs",
        }
      ),
      outputType: zField(z.enum(["text", "number", "boolean", "dictionary"]), {
        label: "Output Type",
        placeholder: "Select the output type",
      }),
      isList: zField(z.boolean().default(false), {
        label: "Output Is List",
        placeholder: "Will the output be a list?",
      }),
    }),
    executable: true,
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

export type PrimitiveType =
  | "text"
  | "file"
  | "number"
  | "date"
  | "boolean"
  | "dictionary"
  | "any";

export type TypedHandle =
  | {
      id?: string;
      label?: string;
      isList?: boolean;
      type: PrimitiveType;
    }
  | {
      id?: string;
      isList: boolean;
      label?: string;
      type: "union";
      types: PrimitiveType[];
    };

export function getNodeSourceHandles(node: AppNode): TypedHandle[] {
  switch (node.type) {
    case "input":
      return [
        {
          type: (node as InputNode).data.type,
          isList: (node as InputNode).data.isList,
        },
      ];
    case "extract":
      return [
        {
          type: "dictionary",
          isList: node.data.isList || false,
        },
      ];
    case "llm":
      return [
        {
          type: "text",
          isList: false,
        },
      ];
    case "attachment":
      return [
        {
          type: "file",
          isList: false,
        },
      ];
    case "subflow": {
      const flow = useFlowStore
        .getState()
        .flows.find((flow) => flow.id === (node as SubflowNode).data.flowId);

      if (!flow) {
        return [];
      }

      const outputNodes = flow.nodes.filter((node) => node.type === "output");

      return outputNodes.map((node) => ({
        id: node.id,
        label: (node as OutputNode).data.label,
        type: (node as OutputNode).data.type,
        isList: (node as OutputNode).data.isList,
      }));
    }
    case "javascript": {
      const { outputType, isList } = (node as JavaScriptNode).data;

      return [
        {
          type: outputType || "any",
          isList,
        },
      ];
    }

    default:
      return [];
  }
}

export function getNodeTargetHandles(node: AppNode): TypedHandle[] {
  switch (node.type) {
    case "extract":
      return [
        {
          type: "any",
          isList: true,
        },
      ];
    case "llm":
      return [
        {
          type: "any",
          isList: true,
        },
      ];
    case "subflow": {
      const flow = useFlowStore
        .getState()
        .flows.find((flow) => flow.id === (node as SubflowNode).data.flowId);

      if (!flow) {
        return [];
      }

      const inputNodes = flow.nodes.filter((node) => node.type === "input");

      return inputNodes.map((node) => ({
        id: node.id,
        label: (node as InputNode).data.label,
        type: (node as InputNode).data.type,
        isList: (node as InputNode).data.isList,
      }));
    }
    case "output":
      return [
        {
          type: (node as OutputNode).data.type,
          isList: (node as OutputNode).data.isList,
        },
      ];
    case "javascript": {
      const { inputs } = (node as JavaScriptNode).data;

      return (
        inputs
          ?.map(
            (input, index) =>
              input && {
                id: String(index),
                label: input.name,
                type: input.type,
                isList: input.isList,
              }
          )
          .filter(Boolean) || []
      );
    }
    default:
      return [];
  }
}
