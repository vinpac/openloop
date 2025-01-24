import { useNodeExecutionStore } from "@/stores/node-execution-store";
import { useReactFlow } from "@xyflow/react";
import { useApiKeyStore } from "@/stores/api-key-store";
import { Button } from "@/components/ui/button";
import { TbPlayerPlayFilled } from "react-icons/tb";
import { runWorkflow } from "@/workflow/run";

interface RunButtonProps {
  onRun: () => void;
}

export function RunButton({ onRun }: RunButtonProps) {
  const { getNodes, getEdges } = useReactFlow();
  const { setNodeState, clearAllStates } = useNodeExecutionStore();
  const openaiKey = useApiKeyStore((state) => state.openaiKey);

  const runFlow = async () => {
    if (!openaiKey) {
      alert("Please set your OpenAI API key first");
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
      className="bg-pink-100 hover:bg-pink-200 text-pink-500 font-semibold rounded-lg border border-pink-500 transition-colors z-50 flex items-center gap-2"
    >
      <TbPlayerPlayFilled />
      Run Flow
    </Button>
  );
}
