import { AttachmentNode } from "@/nodes/types";
import { WorkflowExecutor } from "@/workflow/types";

const attachment: WorkflowExecutor<AttachmentNode> = async (node) => {
  if (!node.data.file) {
    throw new Error("File is required");
  }

  return node.data.file;
};

export default attachment;
