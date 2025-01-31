import attachment from "./attachment";
import llm from "./llm";
import extract from "./extract";
import subflow from "./subflow";
import { NodeExecutor } from "@/workflow/types";
import javascript from "./javascript";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WORKFLOW_EXECUTORS: Record<string, NodeExecutor<any>> = {
  attachment: attachment,
  llm,
  extract,
  subflow,
  javascript,
};
