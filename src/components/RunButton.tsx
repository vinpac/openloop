import { useWorkflowExecutionStore } from "@/stores/node-execution-store";
import { useReactFlow } from "@xyflow/react";
import { useApiKeyStore } from "@/stores/api-key-store";
import { Button } from "@/components/ui/button";
import { TbPlayerPlayFilled } from "react-icons/tb";
import toast from "react-hot-toast";
import { z } from "zod";
import { InputNode } from "@/nodes/types";
import { zField } from "@/components/zod-form/helpers";
import { runWorkflow } from "@/workflow/run";

interface RunButtonProps {
  onRun: () => void;
}

export function RunButton({ onRun }: RunButtonProps) {
  const { getNodes } = useReactFlow();
  const { clearAllStates } = useWorkflowExecutionStore();
  const openaiKey = useApiKeyStore((state) => state.openaiKey);

  const runFlow = async () => {
    if (!openaiKey) {
      toast.error("Please set your OpenAI API key first");
      return;
    }

    const inputNodes = getNodes().filter(
      (node) => node.type === "input"
    ) as InputNode[];

    clearAllStates();

    onRun();

    if (inputNodes.length > 0) {
      useWorkflowExecutionStore.setState({
        input: undefined,
        inputSchema: z.object(
          Object.fromEntries(
            inputNodes.map((node) => {
              const field = {
                text: z.string(),
                number: z.number(),
                boolean: z.boolean(),
                date: z.date(),
                dictionary: z.record(z.string(), z.any()),
                file: z.record(z.string(), z.any()),
              }[node.data.type];

              return [
                node.id,
                zField(node.data.isList ? z.array(field) : field, {
                  label: node.data.label,
                  typeName: node.data.type,
                }),
              ];
            })
          )
        ),
      });
      return;
    }

    useWorkflowExecutionStore.setState({
      inputSchema: undefined,
      input: undefined,
    });
    await runWorkflow();
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
