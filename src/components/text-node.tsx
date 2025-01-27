import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { useDebounce } from "@/hooks/use-debounce";
import RichTextEditor from "@/components/rich-text-editor";
import { NodeIcon } from "@/components/node-icon";
import { Editor, JSONContent } from "@tiptap/core";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TbTrash } from "react-icons/tb";

export const TextNode = ({
  id,
  data,
}: {
  id: string;
  data: { content?: unknown };
}) => {
  const { updateNode, setNodes, setEdges } = useReactFlow();
  const handleChange = useDebounce((_: unknown, editor: Editor) => {
    updateNode(id, {
      data: { content: !editor.getText().trim() ? null : editor.getJSON() },
    });
  }, 200);
  const handleRemoval = useCallback(() => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) =>
      edges.filter((e) => e.source !== id && e.target !== id)
    );
  }, [id, setEdges, setNodes]);

  const isEmpty = !data.content;

  return (
    <div
      className={[
        "px-2 pb-2 pt-1 min-w-[200px]",
        "[&_.ProseMirror]:border-dashed [&_.ProseMirror]:p-4 [&_.ProseMirror]:rounded-md [&_.ProseMirror]:border-2 [&_.ProseMirror]:border-transparent",
        "[&_.ProseMirror-focused]:!border-stone-200",
        "[&_.ProseMirror:hover]:!border-stone-200",
        isEmpty ? "[&_.ProseMirror]:!border-stone-200" : "",
      ].join(" ")}
    >
      <header
        data-header
        className={cn(
          " flex items-center rounded-t mb-2 cursor-grab gap-1 text-sm font-medium px-2 py-1.5",
          !isEmpty ? "group-hover/node:visible invisible" : ""
        )}
      >
        <NodeIcon node={{ type: "text" }} className="w-5 h-5 flex-shrink-0" />
        <span>Text</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-3 text-stone-600 p-0 text-xs gap-1 ml-auto"
          onClick={handleRemoval}
        >
          <TbTrash />
          Remove
        </Button>
      </header>
      <RichTextEditor
        placeholder="Enter text here..."
        onUpdate={handleChange}
        defaultContent={data.content as JSONContent}
        className="nodrag cursor-text"
      />
    </div>
  );
};
