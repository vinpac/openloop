import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export async function streamOpenAIResponse({
  apiKey,
  model,
  messages,
  onToken,
}: {
  apiKey: string;
  model: string;
  messages: ChatCompletionMessageParam[];
  onToken: (token: string) => void;
}) {
  const openai = new OpenAI({
    apiKey,
    // for the challenge purpose
    dangerouslyAllowBrowser: true,
  });
  const stream = await openai.chat.completions.create({
    model,
    messages,
    stream: true,
  });

  let fullResponse = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      fullResponse += content;
      onToken(content);
    }
  }

  return fullResponse;
}
