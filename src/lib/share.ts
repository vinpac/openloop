import { AppNode } from "@/nodes/types";
import { Edge } from "@xyflow/react";

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

export function serializeWorkflow(nodes: AppNode[], edges: Edge[]): string {
  const state = {
    nodes,
    edges,
  };

  return encodeURIComponent(encodeBase64(JSON.stringify(state)));
}

export function deserializeWorkflow(data: string): {
  nodes: AppNode[];
  edges: Edge[];
} {
  try {
    const decoded = JSON.parse(decodeBase64(decodeURIComponent(data)));
    return {
      nodes: decoded.nodes,
      edges: decoded.edges,
    };
  } catch (e) {
    console.error("Failed to deserialize workflow:", e);
    throw new Error("Invalid workflow data");
  }
}
