import attachment from "./attachment";
import llm from "./llm";
import extract from "./extract";
import subflow from "./subflow";
import { WorkflowExecutor } from "@/workflow/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WORKFLOW_EXECUTORS: Record<string, WorkflowExecutor<any>> = {
  attachment: attachment,
  llm,
  extract,
  subflow,
};
