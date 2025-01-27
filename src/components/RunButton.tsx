import { useNodeExecutionStore } from "@/stores/node-execution-store";
import { useReactFlow } from "@xyflow/react";
import { useApiKeyStore } from "@/stores/api-key-store";
import { Button } from "@/components/ui/button";
import { TbPlayerPlayFilled } from "react-icons/tb";
import { runWorkflow } from "@/workflow/run";
import toast from "react-hot-toast";

interface RunButtonProps {
  onRun: () => void;
}

export function RunButton({ onRun }: RunButtonProps) {
  const { getNodes, getEdges } = useReactFlow();
  const { setNodeState, clearAllStates } = useNodeExecutionStore();
  const openaiKey = useApiKeyStore((state) => state.openaiKey);

  const runFlow = async () => {
    if (!openaiKey) {
      toast.error("Please set your OpenAI API key first");
      return;
    }

    clearAllStates();
    onRun();

    await runWorkflow({
      nodes: getNodes(),
      edges: getEdges(),
      ctx: { openaiKey },
      onNodeStateChange: (nodeId, state) => {
        setNodeState(nodeId, (prev) => ({
          ...prev,
          ...state,
        }));
      },
    });
  };

  return (
    <Button
      onClick={runFlow}
      className="bg-primary-600 px-4 hover:bg-primary-700 text-white font-semibold rounded-md transition-colors z-50 flex items-center gap-2"
    >
      <TbPlayerPlayFilled />
      Run Flow
    </Button>
  );
}
