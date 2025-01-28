import { Button } from "@/components/ui/button";
import { serializeWorkflow } from "@/lib/share";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/stores/flow-store";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { HiMiniLink } from "react-icons/hi2";
import { MdCheck } from "react-icons/md";

export const ShareButton = () => {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = useCallback(() => {
    const serialized = serializeWorkflow(useFlowStore.getState().flows);
    const url = new URL(window.location.href);
    url.searchParams.set("flow", serialized);
    navigator.clipboard.writeText(url.toString());
    toast.success("Shareable URL copied to clipboard!");
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  }, []);

  return (
    <Button
      onClick={handleShare}
      className={cn(
        isCopied
          ? "!text-green-600 !bg-green-100 !border-green-600"
          : "text-gray-600"
      )}
      variant="outline"
    >
      {isCopied ? <MdCheck /> : <HiMiniLink />}
    </Button>
  );
};
