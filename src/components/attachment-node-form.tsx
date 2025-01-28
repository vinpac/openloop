import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { useEvent } from "@/hooks/use-event";
import { AppNode, AttachmentNode } from "@/nodes/types";
import { useReactFlow } from "@xyflow/react";
import { TbPdf, TbFileText, TbX } from "react-icons/tb";

export const AttachmentNodeForm = (node: AppNode) => {
  const { updateNode } = useReactFlow();
  const storedFile = (
    node.data as unknown as { file?: AttachmentNode["data"]["file"] }
  ).file;
  const handleFileChange = useEvent(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // read file content
        const reader = new FileReader();
        if (file.type === "application/pdf") {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsText(file);
        }
        reader.onload = async () => {
          updateNode(node.id, {
            data: {
              file: {
                name: file.name,
                size: file.size,
                type: file.type,
                content: await parseFileContent(file, reader.result),
              } satisfies AttachmentNode["data"]["file"],
            },
          });
        };
      }
    }
  );
  const removeFile = useEvent(() => {
    updateNode(node.id, {
      data: {
        file: undefined,
      },
    });
  });
  const Icon = storedFile?.type === "application/pdf" ? TbPdf : TbFileText;

  return (
    <div className="px-2 pb-2 pt-1 min-w-0 items-center">
      {!storedFile && (
        <Input
          placeholder="Select a file"
          type="file"
          onChange={handleFileChange}
        />
      )}
      {storedFile && (
        <div className="h-8 rounded border-2 gap-1.5 font-bold border-stone-200 font-mono px-1.5 flex-grow text-xs items-center flex min-w-0">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate flex-grow">{storedFile.name}</span>
          <span className="text-stone-500 whitespace-nowrap text-xs">
            {formatFileSize(storedFile.size)}
          </span>
          <Button
            className="px-1"
            variant="ghost"
            size="sm"
            onClick={removeFile}
          >
            <TbX />
          </Button>
        </div>
      )}
      {storedFile && (
        <HoverCard>
          <HoverCardTrigger className="flex cursor-help text-xs gap-2 min-w-0 pt-2">
            <span className="text-xs text-stone-500 uppercase flex-shrink-0">
              Extracted Content:
            </span>
            <div className="text-xs truncate flex-grow">
              {storedFile.content}
            </div>
          </HoverCardTrigger>
          <HoverCardContent>{storedFile.content}</HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
};

const formatFileSize = (size: number) => {
  return `${(size / 1024).toFixed(2)} KB`;
};

const parseFileContent = async (
  file: File,
  content: string | ArrayBuffer | null
) => {
  if (file.type === "application/pdf") {
    const pdfjs = await import("pdfjs-dist");
    const pdfjsWorker = await import(
      "pdfjs-dist/build/pdf.worker.mjs?worker"
    ).then((m) => m.default);

    console.log(content);
    pdfjs.GlobalWorkerOptions.workerPort = new pdfjsWorker();
    const pdf = await pdfjs.getDocument(content as ArrayBuffer).promise;
    const numPages = pdf.numPages;
    let extractedText = "";

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Concatenate all text from the page
      textContent.items.forEach((item) => {
        const str = (item as unknown as { str: string }).str;
        if (str) extractedText += str + " ";
      });
    }

    return extractedText;
  }

  if (content) {
    return content.toString();
  }

  return "";
};
