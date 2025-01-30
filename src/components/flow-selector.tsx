import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuContent,
} from "@/components/ui/context-menu";

import { useFlowStore } from "@/stores/flow-store";
import { Plus } from "lucide-react";
import React from "react";
import { useState } from "react";
import InputAutosize from "react-input-autosize";

export function FlowSelector() {
  const {
    flows,
    activeFlowId,
    setActiveFlow,
    updateFlow,
    removeFlow,
    addFlow,
  } = useFlowStore();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renamingValue, setRenamingValue] = useState("");

  const handleNewFlow = () => {
    const flowId = addFlow(`Flow ${flows.length + 1}`);
    setActiveFlow(flowId);
  };

  return (
    <div className="fixed bg-white h-11 flex-nowrap items-center whitespace-nowrap overflow-x-auto no-scrollbar border-t bottom-0 left-0 right-0 flex gap-1 px-2 py-1.5 z-50">
      {flows.map((flow, i) => {
        const isActive = activeFlowId === flow.id;
        const button = (
          <Button
            key={flow.id}
            asChild
            variant={isActive ? "default" : "ghost"}
            onClick={() => {
              setActiveFlow(flow.id);
              if (isActive && !isRenaming) {
                setIsRenaming(true);
                setRenamingValue(flow.name);
              }
            }}
          >
            {isActive && isRenaming ? (
              <InputAutosize
                type="text"
                autoFocus
                value={renamingValue}
                onChange={(e) => setRenamingValue(e.target.value)}
                className="[&_input]:outline-none [&_input]:bg-transparent [&_input]:text-inherit !py-0 [&_input]:h-full"
                onBlur={() => {
                  setIsRenaming(false);
                  const value = renamingValue.trim();
                  if (value) {
                    updateFlow(flow.id, { name: value });
                  }
                  setRenamingValue("");
                }}
              />
            ) : (
              <button>{flow.name}</button>
            )}
          </Button>
        );

        if (i === 0) {
          // the main flow is always the first one and cannot be deleted
          return (
            <React.Fragment key={flow.id}>
              {button}
              <hr className="w-px flex-shrink-0 h-4 border-r bg-stone-200" />
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={flow.id}>
            <ContextMenu>
              <ContextMenuTrigger asChild>{button}</ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem asChild>
                  <button
                    className="w-full cursor-pointer"
                    onClick={() => {
                      if (confirm(`Delete "${flow.name}"?`)) {
                        removeFlow(flow.id);
                        if (activeFlowId === flow.id) {
                          setActiveFlow(flows[i - 1].id);
                        }
                      }
                    }}
                  >
                    Delete "{flow.name}"
                  </button>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <hr className="w-px flex-shrink-0 h-4 border-r bg-stone-200" />
          </React.Fragment>
        );
      })}
      <Button
        variant="ghost"
        onClick={handleNewFlow}
        className="text-stone-400 hover:text-stone-800"
      >
        <Plus className=" h-4 w-4" />
        <span>New Flow</span>
      </Button>
    </div>
  );
}
