import { ZodForm } from "@/components/zod-form/form";
import { getNodeTargetHandles, nodeDefinitionById } from "@/nodes/index";
import { JavaScriptNode } from "@/nodes/types";
import { useMemo, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useReactFlow } from "@xyflow/react";
import { useDebounce } from "@/hooks/use-debounce";

export const JavaScriptNodeForm = (node: JavaScriptNode) => {
  const { updateNode, setEdges } = useReactFlow();
  const schema = useMemo(
    () => nodeDefinitionById.javascript.input.omit({ code: true }),
    []
  );
  const targetHandles = useMemo(() => getNodeTargetHandles(node), [node]);
  const defaultCode = useMemo(() => {
    return `
function main(${targetHandles.map((h) => `${h.label}`).join(", ")}) {
  // do something with the inputs
}
    `.trim();
  }, [targetHandles]);
  const handleChange = useDebounce((values: Record<string, unknown>) => {
    const numberOfInputs = (values.inputs as Array<unknown>)?.length;
    if (!isNaN(numberOfInputs) && numberOfInputs < targetHandles.length) {
      // the user has removed some inputs, we need to remove any edges connected to the removed inputs
      const removedHandles = targetHandles
        .slice(numberOfInputs)
        .map((h) => h.id);

      setEdges((prev) =>
        prev.filter((edge) => {
          if (edge.target !== node.id) return true;

          return !removedHandles.includes(edge.targetHandle || "");
        })
      );
    }

    updateNode(node.id, {
      data: {
        ...values,
        code: node.data.code,
      },
    });
  }, 200);
  const handleCodeChange = useDebounce((value?: string) => {
    updateNode(node.id, {
      data: {
        ...node.data,
        code: value || "",
      },
    });
  }, 200);
  const lastKeyRef = useRef<string | null>(null);
  const key = node.data.code === undefined ? defaultCode : lastKeyRef.current;
  lastKeyRef.current = key;
  return (
    <div>
      <Editor
        key={lastKeyRef.current}
        height="200px"
        defaultLanguage="javascript"
        defaultValue={node.data.code || defaultCode}
        className="nodrag"
        onChange={handleCodeChange}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          folding: true,
          wordWrap: true,
          padding: {
            top: 12,
          },
        }}
      />
      <div className="px-2 nodrag">
        <ZodForm
          schema={schema}
          initialValues={node.data}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};
