import { AppNode } from "@/nodes/types";
import type { IconBaseProps } from "react-icons";
import { TbBrandOpenai, TbFileText, TbTable } from "react-icons/tb";
import { IoText } from "react-icons/io5";
import { RxComponent1 } from "react-icons/rx";

const nodeIconMap: Record<string, React.ComponentType<IconBaseProps>> = {
  text: IoText,
  llm: TbBrandOpenai,
  "file-input": TbFileText,
  extract: TbTable,
  subflow: RxComponent1,
};

export const NodeIcon = ({
  node,
  ...props
}: {
  node: Pick<AppNode, "type">;
} & IconBaseProps) => {
  const Component = nodeIconMap[node.type as keyof typeof nodeIconMap];

  if (!Component) return null;

  return <Component {...props} />;
};
