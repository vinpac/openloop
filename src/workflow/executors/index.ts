import fileInput from "./file-input";
import llm from "./llm";
import extract from "./extract";
import { WorkflowExecutor } from "@/workflow/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WORKFLOW_EXECUTORS: Record<string, WorkflowExecutor<any>> = {
  "file-input": fileInput,
  llm,
  extract,
};
