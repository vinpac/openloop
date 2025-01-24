import { NodeIcon } from "@/components/node-icon";
import { ContextMenuItem } from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { NODE_DEFINITIONS, NodeDefinitionId } from "@/nodes";
import { useState } from "react";
import { z } from "zod";

const nodeTypesById = Object.fromEntries(
  NODE_DEFINITIONS.map((t) => [t.id, t])
);
export const NewNodeContextMenuContent = ({
  onSelect,
}: {
  onSelect: (nodeType: NodeDefinitionId, name?: string) => void;
}) => {
  const [peekedNodeDefinitionId, setPeekedNodeDefinitionId] =
    useState<NodeDefinitionId>();
  const peekedNodeType = peekedNodeDefinitionId
    ? nodeTypesById[peekedNodeDefinitionId]
    : undefined;
  return (
    <HoverCard>
      <HoverCardTrigger>
        {NODE_DEFINITIONS.map((nodeType) => {
          return (
            <ContextMenuItem
              key={nodeType.id}
              asChild
              onSelect={() => {
                onSelect(nodeType.id, nodeType.name);
              }}
              onMouseEnter={() => setPeekedNodeDefinitionId(nodeType.id)}
            >
              <button className="w-full cursor-pointer gap-2">
                <NodeIcon node={{ type: nodeType.id }} className="text-lg" />
                {nodeType.name}
              </button>
            </ContextMenuItem>
          );
        })}
      </HoverCardTrigger>

      {peekedNodeType && (
        <HoverCardContent
          side="right"
          align="start"
          forceMount
          className="min-h-[200px] w-[300px] -mt-1.5"
          sideOffset={16}
        >
          <h4 className="font-medium leading-none mb-2 flex items-center">
            {/* <NodeIcon type={peekedNodeType.id} className="mr-2" /> */}
            {peekedNodeType.name}
          </h4>
          <div className="text-sm text-stone-600">
            <div className="prose prose-sm">
              {peekedNodeType.description}
              <div className="pt-4 flex flex-col gap-1">
                {describeInput(peekedNodeType.input)}
              </div>
            </div>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );
};

const describeInput = (
  input: z.ZodObject<z.ZodRawShape, z.UnknownKeysParam, z.ZodTypeAny, object>
) => {
  return Object.keys(input.shape).map((key) => {
    return (
      <div key={key}>
        <b className="text-green-600">{key}</b>:{" "}
        {input.shape[key]._def.typeName.replace("Zod", "")}{" "}
      </div>
    );
  });
};
