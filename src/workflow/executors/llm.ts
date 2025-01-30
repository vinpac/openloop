import { streamOpenAIResponse } from "@/lib/openai";
import { LLMNode } from "@/nodes/types";
import { NodeExecutor } from "@/workflow/types";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const llm: NodeExecutor<LLMNode> = async (
  node,
  inputs,
  { openaiKey, onNodeStateChange },
  { log }
) => {
  if (!node.data.prompt) {
    throw new Error("Prompt is required");
  }

  let generated = "";

  const inputMessages: ChatCompletionMessageParam[] =
    Object.values(inputs)?.map((input) => ({
      role: "user",
      content: typeof input === "string" ? input : JSON.stringify(input),
    })) || [];
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: node.data.prompt },
    ...inputMessages,
  ];
  log(`llm messages:`, { messages });

  return await streamOpenAIResponse({
    apiKey: openaiKey,
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
