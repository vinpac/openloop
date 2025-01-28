import { getNodeSourceHandles } from "@/nodes";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";

export function DefaultEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <foreignObject
        width="20"
        height="20"
        x={sourceX + (targetX - sourceX) / 2 - 10}
        y={sourceY + (targetY - sourceY) / 2 - 10}
        data-close-button
        className="invisible"
      >
        <svg
          viewBox="0 0 12 12"
          color="var(--red-500)"
          className="overflow-hidden border-stone-100 bg-stone-100 rounded-full border-4"
        >
          <path
            fill="currentColor"
            d="M1.757 10.243a6.001 6.001 0 1 1 8.488-8.486 6.001 6.001 0 0 1-8.488 8.486ZM6 4.763l-2-2L2.763 4l2 2-2 2L4 9.237l2-2 2 2L9.237 8l-2-2 2-2L8 2.763Z"
          ></path>
        </svg>
      </foreignObject>
    </>
  );
}
