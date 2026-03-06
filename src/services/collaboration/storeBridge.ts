import type { FlowEdge, FlowNode } from '@/lib/types';
import type { CollaborationDocumentState } from './types';

export function createCollaborationDocumentStateFromCanvas(
  roomId: string,
  version: number,
  nodes: FlowNode[],
  edges: FlowEdge[]
): CollaborationDocumentState {
  return {
    roomId,
    version,
    nodes,
    edges,
  };
}

export function applyCollaborationDocumentStateToCanvas(
  state: CollaborationDocumentState,
  setNodes: (nodes: FlowNode[]) => void,
  setEdges: (edges: FlowEdge[]) => void
): void {
  setNodes(state.nodes);
  setEdges(state.edges);
}
