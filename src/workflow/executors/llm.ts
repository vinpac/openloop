import { streamOpenAIResponse } from "@/lib/openai";
import { LLMNode } from "@/nodes/types";
import { WorkflowExecutor, WorkflowInput } from "@/workflow/types";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const llm: WorkflowExecutor<LLMNode> = async (
  node,
  inputs,
  { ctx, onNodeStateChange },
  { log }
) => {
  if (!node.data.prompt) {
    throw new Error("Prompt is required");
  }

  let generated = "";

  const inputMessages: ChatCompletionMessageParam[] =
    inputs?.map((input) => ({
      role: "user",
      content: input as string,
    })) || [];
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: node.data.prompt },
    ...inputMessages,
  ];
  log(`[node:${node.id}] llm messages:`, { messages });

  return await streamOpenAIResponse({
    apiKey: ctx.openaiKey,
    model: node.data.model || "gpt-3.5-turbo",
    messages,
    onToken: (token) => {
      generated += token;
      onNodeStateChange(node.id, {
        output: generated,
      });
    },
  });
};

export default llm;
