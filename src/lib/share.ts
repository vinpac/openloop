import { AppNode } from "@/nodes/types";
import { Edge } from "@xyflow/react";
import { Flow } from "@/stores/flow-store";

const encodeBase64 = (str: string) => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str); // Encode the string into UTF-8 bytes
  return btoa(String.fromCharCode(...encoded)); // Convert the byte array to Base64
};

const decodeBase64 = (str: string) => {
  const decoded = atob(str); // Decode the Base64 string
  const bytes = new Uint8Array([...decoded].map((char) => char.charCodeAt(0))); // Convert back to byte array
  const decoder = new TextDecoder();
  return decoder.decode(bytes); // Decode UTF-8 bytes back to the original string
};

const filterNodeProps = (node: AppNode) => {
  const { id, data, type, position } = node;
  return { id, data, type, position };
};

export function serializeWorkflow(flows: Flow[]): string {
  const state = flows.map((flow) => ({
    id: flow.id,
    name: flow.name,
    nodes: flow.nodes.map(filterNodeProps),
    edges: flow.edges,
  }));

  return encodeURIComponent(encodeBase64(JSON.stringify(state)));
}

interface DecodedFlow {
  id: string;
  name: string;
  nodes: AppNode[];
  edges: Edge[];
}

export function deserializeWorkflow(data: string): Flow[] {
  try {
    const decoded = JSON.parse(decodeBase64(decodeURIComponent(data)));
    return decoded.map((flow: DecodedFlow) => ({
      id: flow.id,
      name: flow.name,
      nodes: flow.nodes,
      edges: flow.edges,
    }));
  } catch (e) {
    console.error("Failed to deserialize workflow:", e);
    throw new Error("Invalid workflow data");
  }
}
