import type { CollaborationDocumentState, CollaborationOperationEnvelope } from './types';

export interface ApplyCollaborationOperationResult {
  nextState: CollaborationDocumentState;
  applied: boolean;
}

export function applyCollaborationOperation(
  state: CollaborationDocumentState,
  operation: CollaborationOperationEnvelope
): ApplyCollaborationOperationResult {
  if (operation.roomId !== state.roomId) {
    return { nextState: state, applied: false };
  }

  switch (operation.type) {
    case 'node.upsert': {
      if (!('node' in operation.payload)) {
        return { nextState: state, applied: false };
      }
      const node = operation.payload.node;
      const existingIndex = state.nodes.findIndex((candidate) => candidate.id === node.id);
      const nextNodes = [...state.nodes];
      if (existingIndex >= 0) {
        nextNodes[existingIndex] = node;
      } else {
        nextNodes.push(node);
      }
      return {
        applied: true,
        nextState: {
          ...state,
          version: state.version + 1,
          nodes: nextNodes,
        },
      };
    }
    case 'node.delete': {
      if (!('nodeId' in operation.payload)) {
        return { nextState: state, applied: false };
      }
      const nodeId = operation.payload.nodeId;
      const nextNodes = state.nodes.filter((node) => node.id !== nodeId);
      const nextEdges = state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
      return {
        applied: true,
        nextState: {
          ...state,
          version: state.version + 1,
          nodes: nextNodes,
          edges: nextEdges,
        },
      };
    }
    case 'edge.upsert': {
      if (!('edge' in operation.payload)) {
        return { nextState: state, applied: false };
      }
      const edge = operation.payload.edge;
      const existingIndex = state.edges.findIndex((candidate) => candidate.id === edge.id);
      const nextEdges = [...state.edges];
      if (existingIndex >= 0) {
        nextEdges[existingIndex] = edge;
      } else {
        nextEdges.push(edge);
      }
      return {
        applied: true,
        nextState: {
          ...state,
          version: state.version + 1,
          edges: nextEdges,
        },
      };
    }
    case 'edge.delete': {
      if (!('edgeId' in operation.payload)) {
        return { nextState: state, applied: false };
      }
      const edgeId = operation.payload.edgeId;
      return {
        applied: true,
        nextState: {
          ...state,
          version: state.version + 1,
          edges: state.edges.filter((edge) => edge.id !== edgeId),
        },
      };
    }
    default:
      return { nextState: state, applied: false };
  }
}

export function applyCollaborationOperations(
  initialState: CollaborationDocumentState,
  operations: CollaborationOperationEnvelope[]
): CollaborationDocumentState {
  return operations.reduce((state, operation) => {
    const result = applyCollaborationOperation(state, operation);
    return result.nextState;
  }, initialState);
}
