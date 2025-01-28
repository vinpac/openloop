import { SubflowNode } from "@/nodes/types";
import { WorkflowExecutor } from "@/workflow/types";
import { useFlowStore } from "@/stores/flow-store";
import { runWorkflow } from "@/workflow/run";

const subflow: WorkflowExecutor<SubflowNode> = async (
  node,
  inputs,
  workflowInput,
  { log }
) => {
  const flowStore = useFlowStore.getState();
  const targetFlow = flowStore.getFlow(node.data.flowId);

  if (!targetFlow) {
    throw new Error(`No flow found with ID: ${node.data.flowId}`);
  }

  log("Running subflow:", targetFlow.name);

  // Create a new execution context for the subflow
  const nodeStates = await runWorkflow({
    ...workflowInput,
    nodes: targetFlow.nodes,
    edges: targetFlow.edges,
  });

  // Return the outputs of all leaf nodes (nodes with no outgoing edges)
  const leafNodes = targetFlow.nodes.filter(
    (n) => !targetFlow.edges.some((e) => e.source === n.id)
  );

  return leafNodes.map((n) => nodeStates[n.id]?.output);
};

export default subflow;
