import type { DesignPreviewEdge, DesignPreviewGraph, DesignPreviewNode } from './designFlowPreviewModel';
import type { DesignFlowPreviewDensity } from './DesignFlowPreview';

export interface LaidOutEdge {
  id: string;
  d: string;
  label?: string;
  labelX?: number;
  labelY?: number;
}

export interface PreviewLayout {
  nodes: Array<DesignPreviewNode & { left: number; top: number }>;
  edges: LaidOutEdge[];
  boundsW: number;
  boundsH: number;
  scale: number;
}

export function layoutGraph(
  graph: DesignPreviewGraph,
  density: DesignFlowPreviewDensity
): PreviewLayout {
  const pad = density === 'compact' ? 10 : 18;
  const minX = Math.min(...graph.nodes.map((n) => n.x));
  const minY = Math.min(...graph.nodes.map((n) => n.y));
  const maxX = Math.max(...graph.nodes.map((n) => n.x + n.width));
  const maxY = Math.max(...graph.nodes.map((n) => n.y + n.height));
  const rawW = Math.max(maxX - minX, 1);
  const rawH = Math.max(maxY - minY, 1);
  const boundsW = rawW + pad * 2;
  const boundsH = rawH + pad * 2;

  // Fit into the preview frame; allow mild upscale so compact packs stay large.
  const targetW = density === 'hero' ? 560 : density === 'card' ? 320 : 160;
  const targetH = density === 'hero' ? 200 : density === 'card' ? 168 : 52;
  const maxScale = density === 'compact' ? 1 : density === 'hero' ? 1.05 : 1.12;
  const scale = Math.min(targetW / boundsW, targetH / boundsH, maxScale);

  const index = new Map<
    string,
    DesignPreviewNode & { left: number; top: number; cx: number; cy: number }
  >();
  const nodes = graph.nodes.map((node) => {
    const left = node.x - minX + pad;
    const top = node.y - minY + pad;
    const laid = {
      ...node,
      left,
      top,
      cx: left + node.width / 2,
      cy: top + node.height / 2,
    };
    index.set(node.id, laid);
    return laid;
  });

  const edges: LaidOutEdge[] = graph.edges
    .map((edge) => edgePath(edge, index))
    .filter((edge): edge is LaidOutEdge => edge !== null);

  return { nodes, edges, boundsW, boundsH, scale };
}

function edgePath(
  edge: DesignPreviewEdge,
  index: Map<
    string,
    { cx: number; cy: number; width: number; height: number; left: number; top: number }
  >
): LaidOutEdge | null {
  const source = index.get(edge.source);
  const target = index.get(edge.target);
  if (!source || !target) {
    return null;
  }

  const dx = target.cx - source.cx;
  const dy = target.cy - source.cy;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  const startInset = Math.min(source.width, source.height) * 0.45;
  const endInset = Math.min(target.width, target.height) * 0.42 + 5;
  const x1 = source.cx + ux * startInset;
  const y1 = source.cy + uy * startInset;
  const x2 = target.cx - ux * endInset;
  const y2 = target.cy - uy * endInset;

  let d: string;
  let labelX: number;
  let labelY: number;

  if (Math.abs(dx) > Math.abs(dy) * 1.15) {
    const midX = (x1 + x2) / 2;
    d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
    labelX = midX;
    labelY = (y1 + y2) / 2 - 10;
  } else {
    const midY = (y1 + y2) / 2;
    d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
    labelX = (x1 + x2) / 2 + 10;
    labelY = midY;
  }

  return {
    id: edge.id,
    d,
    label: edge.label,
    labelX,
    labelY,
  };
}
