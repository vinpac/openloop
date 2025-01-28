import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubflowNode } from "@/nodes/types";
import { useFlowStore } from "@/stores/flow-store";
import { useReactFlow } from "@xyflow/react";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";

export const SubflowNodeForm = (node: SubflowNode) => {
  const { flows, setActiveFlow, addFlow } = useFlowStore();
  const [isOpen, setIsOpen] = useState(false);
  const { updateNode, setEdges } = useReactFlow();

  const activeFlow = flows.find((f) => f.id === node.data.flowId);

  const onChange = (flowId: string) => {
    if (flowId === node.data.flowId) return;

    // remove edges to this node
    setEdges((eds) => eds.filter((e) => e.target !== node.id));
    updateNode(node.id, {
      data: {
        flowId,
      },
    });
  };
  const handleNewFlow = () => {
    const flowId = addFlow(`Flow ${flows.length + 1}`);
    onChange(flowId);

    setTimeout(() => {
      setActiveFlow(flowId);
    }, 100);
  };

  return (
    <div className="px-2 pb-2 pt-1 ">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="justify-between w-full"
          >
            {activeFlow?.name || "Select flow..."}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          {flows.map((flow) => (
            <DropdownMenuItem
              key={flow.id}
              onSelect={() => {
                onChange(flow.id);
                setIsOpen(false);
              }}
            >
              {flow.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onSelect={handleNewFlow}>
            <Plus className=" h-4 w-4" />
            <span>New Flow</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
