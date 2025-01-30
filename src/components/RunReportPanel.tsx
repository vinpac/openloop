import { RunReportNodes } from "@/components/run-report-nodes";
import { Button } from "@/components/ui/button";
import { ZodForm } from "@/components/zod-form/form";
import { Flow } from "@/stores/flow-store";
import { useWorkflowExecutionStore } from "@/stores/node-execution-store";
import { runWorkflow } from "@/workflow/run";

interface RunReportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  flow: Flow;
}

export function RunReportPanel({ isOpen, onClose }: RunReportPanelProps) {
  const inputSchema = useWorkflowExecutionStore((state) => state.inputSchema);
  const hasBeenSubmitted = useWorkflowExecutionStore((state) =>
    Boolean(state.inputSchema && state.input)
  );
  const hasForm = inputSchema && !hasBeenSubmitted;
  const handleSubmit = async (values: Record<string, unknown>) => {
    console.log(values);

    useWorkflowExecutionStore.setState({
      input: values,
    });

    await runWorkflow(values);
  };

  return (
    <div
      className={`fixed top-12 bottom-11 right-0 w-96 bg-white border-l border-stone-200 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } ${!hasForm ? "pt-12" : ""} z-40`}
    >
      {!hasForm ? (
        <div className="flex justify-between h-12 bg-white absolute top-0 left-0 right-0 items-center py-1 pl-3 pr-1 border-b">
          <h2 className="text-sm uppercase font-bold">Run Report</h2>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>
      ) : null}
      {hasForm ? (
        <div className="px-1.5 py-2">
          <div className="rounded-md px-4 py-6 from-stone-100 to-stone-50 bg-gradient-to-tl">
            <ZodForm
              onSubmit={handleSubmit}
              schema={inputSchema}
              className="[&_[data-zod-type='object']]:gap-4"
            >
              <Button type="submit" className="w-full mt-4">
                Run
              </Button>
            </ZodForm>
            <p className="text-xs text-stone-500 mt-2">
              This flow contains input nodes. Please fill in the values below to
              run the flow.
            </p>
          </div>
        </div>
      ) : (
        <RunReportNodes />
      )}
    </div>
  );
}
