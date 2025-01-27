import { ExtractNode } from "@/nodes/types";
import { WorkflowExecutor } from "@/workflow/types";
import { streamOpenAIResponse } from "@/lib/openai";

const extract: WorkflowExecutor<ExtractNode> = async (
  node,
  inputs,
  { ctx, onNodeStateChange }
) => {
  if (!inputs.length) {
    throw new Error(
      `No inputs provided for extract node labelled ${node.data.label}`
    );
  }

  // Construct a prompt that forces JSON output based on the schema
  const schemaDescription = node.data.fields
    .map((field) => {
      return `"${field.name}": ${field.type}${
        field.description ? ` (${field.description})` : ""
      }${field.required ? " (required)" : ""}`;
    })
    .join("\n");

  const systemPrompt = `Extract information according to this schema:
{
${schemaDescription}
}

You must respond with ONLY a valid JSON object or array that matches this schema exactly.
${
  node.data.isList
    ? "The output should be an array of objects."
    : "The output should be a single object."
}
${node.data.prompt ?? ""}`;

  let generated = "";

  const result = await streamOpenAIResponse({
    apiKey: ctx.openaiKey,
    model: node.data.model ?? "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: inputs.join("\n\n") },
    ],
    onToken: (token) => {
      generated += token;

      try {
        const output = parse(generated, node.data.isList);
        onNodeStateChange(node.id, {
          output,
        });
      } catch (e) {
        // ...
      }
    },
  });

  // Validate that the output is valid JSON
  try {
    return JSON.parse(result);
  } catch (e) {
    throw new Error(
      `LLM did not return valid JSON. Returned: \n\n${result}\n\n${result}`
    );
  }
};

export default extract;

function parse(raw: string, isList: boolean) {
  let str = raw;
  try {
    return JSON.parse(str);
  } catch (e) {
    try {
      str = str + "}";
      return JSON.parse(str);
    } catch (e) {
      if (isList) {
        try {
          str = str + "]";
          return JSON.parse(str);
        } catch (e) {
          return JSON.parse(raw + "]");
        }
      }
      throw e;
    }
  }
}
