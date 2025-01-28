import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFlowStore } from "@/stores/flow-store";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";

export function FlowSelector() {
  const { flows, activeFlowId, setActiveFlow, addFlow } = useFlowStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeFlow = flows.find((f) => f.id === activeFlowId);

  const handleNewFlow = () => {
    const flowId = addFlow(`Flow ${flows.length + 1}`);
    setActiveFlow(flowId);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[200px] justify-between"
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
              setActiveFlow(flow.id);
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
  );
}
