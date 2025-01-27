import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const DownloadAsCsvButton = ({ data }: { data: unknown }) => {
  const downloadAsCsv = (data: Record<string, unknown>[], filename: string) => {
    // Get headers from first row
    const headers = Object.keys(data[0]);

    // Convert data to CSV format
    const csvContent = [
      headers.join(","), // Header row
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle special cases and escaping
            if (value === null || value === undefined) return "";
            if (
              typeof value === "string" &&
              (value.includes(",") ||
                value.includes('"') ||
                value.includes("\n"))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return String(value);
          })
          .join(",")
      ),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-xs px-2 border-green-800 bg-green-50 hover:bg-green-100"
      onClick={() =>
        downloadAsCsv(data as Record<string, unknown>[], "workflow-data")
      }
    >
      <Download className="w-2 h-2" />
      Download CSV
    </Button>
  );
};
