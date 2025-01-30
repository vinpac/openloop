import { AttachmentNode } from "@/nodes/types";
import { NodeExecutor } from "@/workflow/types";

const attachment: NodeExecutor<AttachmentNode> = async (node) => {
  if (!node.data.file) {
    throw new Error("File is required");
  }

  return node.data.file;
};

export default attachment;
