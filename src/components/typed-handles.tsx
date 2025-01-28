import { cn } from "@/lib/utils";
import { TypedHandle } from "@/nodes";
import { Handle, Position, useReactFlow } from "@xyflow/react";

export const TypedHandles = ({
  handles,
  type,
  position,
}: {
  handles: TypedHandle[];
  nodeId: string;
  type: "source" | "target";
  position: Position;
}) => {
  if (handles.length === 0) return null;

  return (
    <div
      className={cn(
        "justify-between flex px-8 absolute left-0 right-0 ",
        position === Position.Bottom ? "bottom-0" : "top-0"
      )}
    >
      {handles.map((handle, i) => (
        <Handle
          key={handle.id || handle.type?.concat(String(i)) || String(i)}
          id={handle.id}
          position={position}
          type={type}
          className="!relative inset-auto mx-auto"
        >
          <span
            className={[
              "absolute text-xs w-auto text-center whitespace-nowrap font-bold font-mono flex  flex-col",
              "bg-stone-100 px-1 py-1 rounded",
              // TODO: replace this small layout fix to center the handle label
              "-translate-x-1/2",
              position === Position.Bottom
                ? "top-full mt-2"
                : "bottom-full mb-2",
            ].join(" ")}
          >
            {handle.label && (
              <span className="block text-primary-900">{handle.label}</span>
            )}
            <span className="text-primary-600">
              {handle.type}
              {handle.isList ? "[]" : ""}
            </span>
          </span>
        </Handle>
      ))}
    </div>
  );
};
