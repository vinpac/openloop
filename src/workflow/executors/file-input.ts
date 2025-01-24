import { FileInputNode } from "@/nodes/types";
import { WorkflowExecutor } from "@/workflow/types";

const fileInput: WorkflowExecutor<FileInputNode> = async (node) => {
  if (!node.data.file) {
    throw new Error("File is required");
  }

  return JSON.stringify(node.data.file) || "";
};

export default fileInput;
