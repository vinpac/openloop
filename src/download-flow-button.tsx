import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

export const DownloadFlowButton = () => {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  const handleDownload = () => {
    const nodes = getNodes();
    const edges = getEdges();
    const flow = { nodes, edges };

    // Create a blob with the flow data
    const blob = new Blob([JSON.stringify(flow, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    // Create a temporary link element and trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.download = "flow.json";
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target?.result as string);
          if (flow.nodes && flow.edges) {
            setNodes(flow.nodes);
            setEdges(flow.edges);
            // Update localStorage to persist the imported flow
            localStorage.setItem("nodes", JSON.stringify(flow.nodes));
            localStorage.setItem("edges", JSON.stringify(flow.edges));
          }
        } catch (error) {
          console.error("Error importing flow:", error);
          alert("Invalid flow file format");
        }
      };
      reader.readAsText(file);
      // Reset the input value so the same file can be imported again
      event.target.value = "";
    },
    [setNodes, setEdges]
  );

  return (
    <div className="flex gap-2">
      <Button onClick={handleDownload}>
        <Download />
      </Button>
      <Button asChild>
        <label className="cursor-pointer">
          <Upload />
          <input
            type="file"
            className="hidden"
            accept=".json"
            onChange={handleImport}
          />
        </label>
      </Button>
    </div>
  );
};
