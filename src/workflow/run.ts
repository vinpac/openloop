import { AppNode, NodeExecutionState, OutputNode } from "@/nodes/types";
import { NodeState, FlowContext } from "@/workflow/types";
import { WORKFLOW_EXECUTORS } from "@/workflow/executors";
import { nodeDefinitionById } from "@/nodes";
import { useFlowStore } from "@/stores/flow-store";
import { useWorkflowExecutionStore } from "@/stores/node-execution-store";
import { useApiKeyStore } from "@/stores/api-key-store";
import toast from "react-hot-toast";

export async function runWorkflow(
  inputs?: Record<string, unknown>
): Promise<void> {
  const { setNodeState } = useWorkflowExecutionStore.getState();
  const flows = useFlowStore.getState().flows;
  const onNodeStateChange = (
    nodeId: string,
    state: Partial<NodeExecutionState>
  ) => {
    setNodeState(nodeId, (prev) => ({
      ...prev,
      ...state,
    }));
  };
  const openaiKey = useApiKeyStore.getState().openaiKey;

  if (!openaiKey) {
    toast.error("OpenAI key is not set");
    throw new Error("OpenAI key is not set");
  }

  const workflowInput: FlowContext = {
    flowId: flows[0].id,
    flows,
    inputs,
    openaiKey,
    onNodeStateChange,
  };

  await runFlow(workflowInput);
}

export async function runFlow(
  flowInput: FlowContext & {
    flowId: string;
  }
): Promise<Map<string, unknown>> {
  const flow = flowInput.flows.find((f) => f.id === flowInput.flowId);
  const outputs: Map<string, unknown> = new Map();

  if (!flow) {
    throw new Error(`Unable to find flow ${flowInput.flowId}`);
  }

  const { onNodeStateChange } = flowInput;
  const { edges } = flow;
  const nodes = flow.nodes.filter(
    (n) =>
      nodeDefinitionById[n.type as keyof typeof nodeDefinitionById]
        ?.executable !== false
  );
  // Initialize call stack state
  const callStack = new Map<string, NodeState>();

  // Count incoming edges for each node
  edges.forEach((edge) => {
    const currentCount = callStack.get(edge.target)?.pendingCalls ?? 0;
    callStack.set(edge.target, {
      pendingCalls: currentCount + 1,
      receivedCalls: [],
    });
  });

  const runNode = async (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId) as AppNode | undefined;
    if (!node) return;

    const startedAt = Date.now();

    const newState: NodeExecutionState = {
      flowId: flowInput.flowId,
      isRunning: true,
      startedAt,
    };
    onNodeStateChange(nodeId, newState);

    console.info(`[node:${nodeId}] started`);
    try {
      // Get inputs from received calls if any
      const nodeState = callStack.get(nodeId);
      const inputs = Object.fromEntries(
        nodeState?.receivedCalls.map((c) => [
          c.targetHandle || c.sourceId,
          c.output,
        ]) || []
      );

      console.log("--->", flowInput, node);

      const log = (...args: unknown[]) =>
        console.info(`[node:${nodeId}]`, ...args);

      log("starting", { inputs });

      let output: unknown;
      // dispatch node workflow
      if (node.type === "input") {
        output = flowInput.inputs?.[node.id];
      } else if (node.type === "output") {
        output = Object.values(inputs);

        if ((node as OutputNode).data.isList) {
          if (output && !Array.isArray(output)) {
            output = [output];
          }
        } else if (output && Array.isArray(output)) {
          output = output?.[0];
        }
      } else {
        const executor =
          WORKFLOW_EXECUTORS[node.type as keyof typeof WORKFLOW_EXECUTORS];

        if (!executor) {
          throw new Error(`No executor found for node type: ${node.type}`);
        }
        output = await executor(node, inputs || [], flowInput, {
          log,
        });
      }

      outputs.set(nodeId, output);
      const finishedAt = Date.now();
      log(`finished after ${finishedAt - startedAt}ms`, {
        output,
        inputs,
        startedAt,
        finishedAt,
      });

      onNodeStateChange(nodeId, {
        isRunning: false,
        output,
        finishedAt,
      });

      // sleep for 50ms to provide a visual delay for the challenge
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Register this node's output as a call to all target nodes
      const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        const targetState = callStack.get(edge.target);
        if (targetState) {
          targetState.receivedCalls.push({
            nodeId: edge.target,
            targetHandle: edge.targetHandle || undefined,
            sourceId: nodeId,
            output,
          });
          targetState.pendingCalls--;

          // If all inputs are received, run the target node
          if (targetState.pendingCalls === 0) {
            await runNode(edge.target);
          }
        }
      }
    } catch (error) {
      const errorState: NodeExecutionState = {
        flowId: flowInput.flowId,
        isRunning: false,
        error: error instanceof Error ? error.message : "An error occurred",
        finishedAt: Date.now(),
      };
      onNodeStateChange(nodeId, errorState);
    }
  };

  // Start with root nodes (nodes with no incoming edges)
  const rootNodes = nodes.filter(
    (node) => !edges.some((edge) => edge.target === node.id)
  );

  // Run each root node
  for (const node of rootNodes) {
    await runNode(node.id);
  }

  return outputs;
}
