import { Button } from "@/components/ui/button";
import { serializeWorkflow } from "@/lib/share";
import { cn } from "@/lib/utils";
import { AppNode } from "@/nodes/types";
import { useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { HiMiniLink } from "react-icons/hi2";
import { MdCheck } from "react-icons/md";

export const ShareButton = () => {
  const { getNodes, getEdges } = useReactFlow();
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();
    const serialized = serializeWorkflow(nodes as AppNode[], edges);
    const url = new URL(window.location.href);
    url.searchParams.set("flow", serialized);
    navigator.clipboard.writeText(url.toString());
    toast.success("Shareable URL copied to clipboard!");
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  }, [getNodes, getEdges]);

  return (
    <Button
      onClick={handleShare}
      className={cn(
        "px-2",
        isCopied ? "!text-green-600 !border-green-600" : "text-gray-600"
      )}
      variant="outline"
    >
      {isCopied ? <MdCheck /> : <HiMiniLink />}
    </Button>
  );
};
