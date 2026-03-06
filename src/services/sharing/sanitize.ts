import type { DiagramType, FlowEdge, FlowNode } from '@/lib/types';

export interface ShareViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface SafeSharePayload {
  nodes: FlowNode[];
  edges: FlowEdge[];
  diagramType?: DiagramType;
  viewport?: ShareViewport;
  version?: string;
}

interface ShareCandidate {
  nodes?: unknown;
  edges?: unknown;
  diagramType?: unknown;
  viewport?: unknown;
  version?: unknown;
  [key: string]: unknown;
}

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function sanitizeViewport(value: unknown): ShareViewport | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  const candidate = value as Partial<ShareViewport>;
  if (typeof candidate.x !== 'number') return undefined;
  if (typeof candidate.y !== 'number') return undefined;
  if (typeof candidate.zoom !== 'number') return undefined;
  return {
    x: candidate.x,
    y: candidate.y,
    zoom: candidate.zoom,
  };
}

export function sanitizeDiagramForSharing(state: ShareCandidate): SafeSharePayload {
  const payload: SafeSharePayload = {
    nodes: Array.isArray(state.nodes) ? cloneValue(state.nodes) : [],
    edges: Array.isArray(state.edges) ? cloneValue(state.edges) : [],
  };

  if (typeof state.diagramType === 'string') {
    payload.diagramType = state.diagramType as DiagramType;
  }
  const viewport = sanitizeViewport(state.viewport);
  if (viewport) {
    payload.viewport = viewport;
  }
  if (typeof state.version === 'string') {
    payload.version = state.version;
  }
  return payload;
}
