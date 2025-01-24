import { ExtractNode } from "@/nodes/types";
import { WorkflowExecutor } from "@/workflow/types";

const extract: WorkflowExecutor<ExtractNode> = async (
  node,
  inputs,
  workflowInput
) => {
  if (!inputs.length) {
    throw new Error(
      `No inputs provided for extract node labelled ${node.data.label}`
    );
  }

  return JSON.stringify(node.data.fields);
};

export default extract;
