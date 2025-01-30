"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { Download, Upload, Trash } from "lucide-react";
import { TbSettingsFilled } from "react-icons/tb";

export function FileDropdown() {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  const handleReset = useCallback(() => {
    if (window.confirm("Are you sure you want to reset the flow?")) {
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  const handleDownload = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();

    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flow.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [getNodes, getEdges]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const flow = JSON.parse(e.target?.result as string);
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
          } catch (error) {
            console.error("Failed to parse flow file:", error);
          }
        };
        reader.readAsText(file);
      }
    },
    [setNodes, setEdges]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="text-gray-600">
          <TbSettingsFilled />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem onSelect={handleDownload}>
          <Download />
          Download Flow
        </DropdownMenuItem>
        <DropdownMenuItem className="relative">
          <Upload />
          <span>Import Flow</span>
          <input
            type="file"
            className="absolute text-[10000px] cursor-pointer opacity-0 top-0 left-0"
            accept=".json"
            onChange={handleImport}
          />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleReset}>
          <Trash />
          Reset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
