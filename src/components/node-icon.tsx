import { AppNode } from "@/nodes/types";
import type { IconBaseProps } from "react-icons";
import { TbBrandOpenai, TbTable } from "react-icons/tb";
import { ImAttachment } from "react-icons/im";
import { IoText } from "react-icons/io5";
import { RxComponent1 } from "react-icons/rx";
import { FaArrowAltCircleDown, FaArrowAltCircleUp } from "react-icons/fa";
const nodeIconMap: Record<string, React.ComponentType<IconBaseProps>> = {
  text: IoText,
  llm: TbBrandOpenai,
  attachment: ImAttachment,
  extract: TbTable,
  subflow: RxComponent1,
  input: FaArrowAltCircleDown,
  output: FaArrowAltCircleUp,
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
