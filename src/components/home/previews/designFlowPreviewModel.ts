import type { FlowEdge, FlowNode } from '@/lib/types';
import { NodeType } from '@/lib/types';

/** Badge tones aligned with canvas / workflow token pairs. */
export type DesignPreviewTone =
  | 'start'
  | 'end'
  | 'process'
  | 'decision'
  | 'input'
  | 'llm'
  | 'kb'
  | 'web'
  | 'code'
  | 'out'
  | 'other';

export interface DesignPreviewNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  tone: DesignPreviewTone;
  kind: 'capsule' | 'rect' | 'diamond';
}

export interface DesignPreviewEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface DesignPreviewGraph {
  nodes: DesignPreviewNode[];
  edges: DesignPreviewEdge[];
}

const MAX_NODES = 7;
const CHIP_H = 34;
const DIAMOND = 92;
const COL_GAP = 40;
const ROW_GAP = 36;
const PAD = 8;

/**
 * Build a thumbnail graph: fixed readable chip sizes + compact layered layout
 * (ignores sparse canvas coordinates that would otherwise shrink everything).
 */
export function graphFromFlowNodes(
  nodes: FlowNode[],
  edges: FlowEdge[]
): DesignPreviewGraph {
  const eligible = nodes.filter(
    (node) =>
      node.type !== NodeType.ANNOTATION &&
      node.type !== NodeType.SECTION &&
      node.type !== NodeType.GROUP &&
      typeof node.position?.x === 'number' &&
      typeof node.position?.y === 'number'
  );

  const selected = pickPreviewNodes(eligible, edges, MAX_NODES);
  const ids = new Set(selected.map((node) => node.id));
  const previewEdges = edges
    .filter((edge) => ids.has(edge.source) && ids.has(edge.target))
    .slice(0, 12)
    .map((edge) => {
      const rawLabel = edge.label;
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: typeof rawLabel === 'string' ? rawLabel : undefined,
      } satisfies DesignPreviewEdge;
    });

  const sized = selected.map((node) => {
    const tone = toneFromNodeType(node.type);
    const kind = kindFromNodeType(node.type, node.data?.shape);
    const label = shortenLabel(node.data?.label ?? node.type ?? '');
    const width =
      kind === 'diamond' ? DIAMOND : chipWidthForLabel(label, kind === 'capsule');
    const height = kind === 'diamond' ? DIAMOND : CHIP_H;
    return {
      id: node.id,
      label,
      tone,
      kind,
      width,
      height,
      x: 0,
      y: 0,
    } satisfies DesignPreviewNode;
  });

  return {
    nodes: layoutPreviewNodes(sized, previewEdges),
    edges: previewEdges,
  };
}

export function toneFromNodeType(type: string | undefined): DesignPreviewTone {
  switch (type) {
    case NodeType.START:
    case 'start':
      return 'start';
    case NodeType.END:
    case 'end':
      return 'end';
    case NodeType.DECISION:
    case 'decision':
    case 'ifElse':
      return 'decision';
    case NodeType.PROCESS:
    case 'process':
    case NodeType.ARCHITECTURE:
    case 'architecture':
      return 'process';
    case 'textInput':
      return 'input';
    case 'llm':
      return 'llm';
    case 'knowledgeRetrieval':
      return 'kb';
    case 'webSearch':
      return 'web';
    case 'code':
      return 'code';
    case 'output':
      return 'out';
    default:
      return 'other';
  }
}

/** Colors match `src/index.css` --wf-t-* and flowchart brand chips. */
export function toneStyles(tone: DesignPreviewTone): { bg: string; fg: string } {
  switch (tone) {
    case 'start':
    case 'out':
      return { bg: '#E2F2E8', fg: '#1F7D4D' };
    case 'end':
      return { bg: '#FBEAE8', fg: '#C4443C' };
    case 'decision':
      return { bg: '#F9EADC', fg: '#B05617' };
    case 'process':
    case 'web':
      return { bg: '#E4EBFA', fg: '#3663C9' };
    case 'input':
      return { bg: '#F6EEDC', fg: '#8A6410' };
    case 'llm':
      return { bg: '#ECE9FA', fg: '#6250C9' };
    case 'kb':
      return { bg: '#DFF0F2', fg: '#16788A' };
    case 'code':
      return { bg: '#EBEEF2', fg: '#4A5568' };
    default:
      return { bg: '#EBEEF2', fg: '#4A5568' };
  }
}

export function kindFromNodeType(
  type: string | undefined,
  shape: FlowNode['data']['shape'] | undefined
): DesignPreviewNode['kind'] {
  if (type === NodeType.DECISION || type === 'decision' || shape === 'diamond') {
    return 'diamond';
  }
  if (type === NodeType.START || type === NodeType.END || type === 'start' || type === 'end') {
    return 'capsule';
  }
  if (shape === 'capsule') {
    return 'capsule';
  }
  return 'rect';
}

function pickPreviewNodes(
  nodes: FlowNode[],
  edges: FlowEdge[],
  max: number
): FlowNode[] {
  if (nodes.length <= max) {
    return nodes;
  }

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  for (const node of nodes) {
    outgoing.set(node.id, []);
    indegree.set(node.id, 0);
  }
  for (const edge of edges) {
    if (!byId.has(edge.source) || !byId.has(edge.target)) {
      continue;
    }
    outgoing.get(edge.source)?.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }

  const roots = nodes
    .filter((node) => (indegree.get(node.id) ?? 0) === 0)
    .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
  const start = roots[0] ?? nodes[0];
  if (!start) {
    return nodes.slice(0, max);
  }

  const ordered: FlowNode[] = [];
  const visited = new Set<string>();
  const queue = [start.id];
  while (queue.length > 0 && ordered.length < max) {
    const id = queue.shift();
    if (!id || visited.has(id)) {
      continue;
    }
    visited.add(id);
    const node = byId.get(id);
    if (node) {
      ordered.push(node);
    }
    const next = (outgoing.get(id) ?? []).slice().sort((a, b) => {
      const na = byId.get(a);
      const nb = byId.get(b);
      return (na?.position.y ?? 0) - (nb?.position.y ?? 0);
    });
    for (const target of next) {
      if (!visited.has(target)) {
        queue.push(target);
      }
    }
  }

  if (ordered.length < max) {
    for (const node of nodes) {
      if (ordered.length >= max) {
        break;
      }
      if (!visited.has(node.id)) {
        ordered.push(node);
        visited.add(node.id);
      }
    }
  }

  return ordered;
}

function layoutPreviewNodes(
  nodes: DesignPreviewNode[],
  edges: DesignPreviewEdge[]
): DesignPreviewNode[] {
  if (nodes.length === 0) {
    return nodes;
  }

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  for (const node of nodes) {
    outgoing.set(node.id, []);
    indegree.set(node.id, 0);
  }
  for (const edge of edges) {
    if (!byId.has(edge.source) || !byId.has(edge.target)) {
      continue;
    }
    outgoing.get(edge.source)?.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }

  const layers: string[][] = [];
  let frontier = nodes
    .filter((node) => (indegree.get(node.id) ?? 0) === 0)
    .map((node) => node.id);
  const placed = new Set<string>();

  while (frontier.length > 0) {
    layers.push(frontier);
    for (const id of frontier) {
      placed.add(id);
    }
    const next: string[] = [];
    for (const id of frontier) {
      for (const target of outgoing.get(id) ?? []) {
        if (placed.has(target) || next.includes(target)) {
          continue;
        }
        const remainingParents = edges.filter(
          (edge) =>
            edge.target === target &&
            byId.has(edge.source) &&
            !placed.has(edge.source)
        ).length;
        if (remainingParents === 0) {
          next.push(target);
        }
      }
    }
    frontier = next;
  }

  for (const node of nodes) {
    if (!placed.has(node.id)) {
      layers.push([node.id]);
      placed.add(node.id);
    }
  }

  let cursorX = PAD;
  const positioned: DesignPreviewNode[] = [];

  for (const layer of layers) {
    const layerNodes = layer
      .map((id) => byId.get(id))
      .filter((node): node is DesignPreviewNode => Boolean(node));
    const layerWidth = Math.max(...layerNodes.map((node) => node.width), 0);
    const totalH =
      layerNodes.reduce((sum, node) => sum + node.height, 0) +
      Math.max(0, layerNodes.length - 1) * ROW_GAP;
    let cursorY = PAD + Math.max(0, (DIAMOND + CHIP_H - totalH) / 2);

    for (const node of layerNodes) {
      positioned.push({
        ...node,
        x: cursorX + (layerWidth - node.width) / 2,
        y: cursorY,
      });
      cursorY += node.height + ROW_GAP;
    }
    cursorX += layerWidth + COL_GAP;
  }

  return positioned;
}

function chipWidthForLabel(label: string, capsule: boolean): number {
  const base = capsule ? 52 : 48;
  const estimated = base + label.length * 12;
  return clamp(estimated, capsule ? 88 : 100, 148);
}

function shortenLabel(label: string): string {
  const compact = label.replace(/\s+/g, ' ').trim();
  if (compact.length <= 8) {
    return compact;
  }
  return `${compact.slice(0, 7)}…`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
