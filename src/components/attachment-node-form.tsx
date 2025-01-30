import { AttachedFile, FileInput } from "@/components/file-input";
import { useEvent } from "@/hooks/use-event";
import { AttachmentNode } from "@/nodes/types";
import { useReactFlow } from "@xyflow/react";

export const AttachmentNodeForm = (node: AttachmentNode) => {
  const { updateNode } = useReactFlow();
  const handleFileChange = useEvent((value: AttachedFile | null) => {
    updateNode(node.id, {
      data: {
        file: value,
      },
    });
  });

  return (
    <FileInput
      className="px-2 pb-2 pt-1 min-w-0 items-center"
      value={node.data.file}
      onChange={handleFileChange}
    />
  );
};
