import { JavaScriptNode } from "@/nodes/types";
import { NodeExecutor } from "@/workflow/types";

const javascript: NodeExecutor<JavaScriptNode> = async (node, inputs) => {
  const { code } = node.data;

  console.log(`(${code})(${node.data.inputs.map((i) => i.name).join(",")})`);
  return new Function(
    ...node.data.inputs.map((i) => i.name),
    `return (${code})(${node.data.inputs.map((i) => i.name).join(",")})`
  )(...Object.values(inputs));
};

export default javascript;
