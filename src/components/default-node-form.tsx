import { ZodForm } from "@/components/zod-form/form";
import { useDebounce } from "@/hooks/use-debounce";
import { NODE_DEFINITIONS } from "@/nodes";
import { AppNode } from "@/nodes/types";
import { useReactFlow } from "@xyflow/react";
import { useMemo } from "react";

export const DefaultNodeForm = (node: AppNode) => {
  const { updateNode } = useReactFlow();
  const inputSchema = useMemo(
    () =>
      NODE_DEFINITIONS.find((definition) => definition.id === node.type)?.input,
    [node.type]
  );
  const handleChange = useDebounce((values: Record<string, unknown>) => {
    updateNode(node.id, { data: values });
  }, 200);

  return (
    <div className="pb-2">
      {inputSchema && (
        <ZodForm
          schema={inputSchema}
          className="nodrag gap-4 flex flex-col px-2"
          initialValues={node.data}
          onChange={handleChange}
        />
      )}
    </div>
  );
};
