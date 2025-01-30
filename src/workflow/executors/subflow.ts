import { SubflowNode } from "@/nodes/types";
import { NodeExecutor } from "@/workflow/types";
import { runFlow } from "@/workflow/run";

const subflow: NodeExecutor<SubflowNode> = async (
  node,
  inputs,
  ctx
): Promise<Record<string, unknown>> => {
  console.log(inputs, ctx);
  // Return the outputs of all leaf nodes (nodes with no outgoing edges)
  const flow = ctx.flows.find((f) => f.id === node.data.flowId);

  if (!flow) {
    throw new Error(`Unable to find flow ${node.data.flowId}`);
  }

  // Create a new execution context for the subflow
  const outputs = await runFlow({
    ...ctx,
    flowId: flow.id,
    inputs,
  });

  const outputNodesIds = flow.nodes
    .filter((n) => n.type === "output")
    .map((o) => o.id);

  return Object.fromEntries(
    Array.from(outputs.entries()).filter(([key]) =>
      outputNodesIds.includes(key)
    )
  );
};

export default subflow;
