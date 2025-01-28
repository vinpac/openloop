import { AppNode, NodeExecutionState } from "@/nodes/types";
import { NodeState, WorkflowInput } from "@/workflow/types";
import { WORKFLOW_EXECUTORS } from "@/workflow/executors";
import { nodeDefinitionById } from "@/nodes";

export async function runWorkflow(
  workflowInput: WorkflowInput
): Promise<Record<string, NodeExecutionState>> {
  const { onNodeStateChange, nodes: allNodes, edges } = workflowInput;
  const nodes = allNodes.filter(
    (n) =>
      nodeDefinitionById[n.type as keyof typeof nodeDefinitionById]
        ?.executable !== false
  );
  // Initialize call stack state
  const callStack = new Map<string, NodeState>();
  const nodeStates: Record<string, NodeExecutionState> = {};

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

    const newState: NodeExecutionState = { isRunning: true, startedAt };
    nodeStates[nodeId] = newState;
    onNodeStateChange(nodeId, newState);

    console.info(`[node:${nodeId}] started`);
    try {
      // Get inputs from received calls if any
      const nodeState = callStack.get(nodeId);
      const inputs = nodeState?.receivedCalls.map((c) => c.output);

      // dispatch node workflow
      const executor =
        WORKFLOW_EXECUTORS[node.type as keyof typeof WORKFLOW_EXECUTORS];
      if (!executor) {
        throw new Error(`No executor found for node type: ${node.type}`);
      }
      const log = (...args: unknown[]) =>
        console.info(`[node:${nodeId}]`, ...args);

      log("starting", { inputs });
      const output = await executor(node, inputs || [], workflowInput, {
        log,
      });

      const finishedAt = Date.now();
      log(`finished after ${finishedAt - startedAt}ms`, {
        output,
        inputs,
        startedAt,
        finishedAt,
      });

      const updatedState: NodeExecutionState = {
        isRunning: false,
        output,
        finishedAt,
      };
      nodeStates[nodeId] = updatedState;
      onNodeStateChange(nodeId, updatedState);

      // sleep for 50ms to provide a visual delay for the challenge
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Register this node's output as a call to all target nodes
      const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        const targetState = callStack.get(edge.target);
        if (targetState) {
          targetState.receivedCalls.push({
            nodeId: edge.target,
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
        isRunning: false,
        error: error instanceof Error ? error.message : "An error occurred",
        finishedAt: Date.now(),
      };
      nodeStates[nodeId] = errorState;
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

  return nodeStates;
}
