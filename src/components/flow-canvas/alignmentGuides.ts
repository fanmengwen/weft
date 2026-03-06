import type { FlowNode } from '@/lib/types';

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 96;

export interface AlignmentGuides {
  verticalFlowX: number | null;
  horizontalFlowY: number | null;
}

function resolveNodeSize(node: FlowNode): { width: number; height: number } {
  const styleWidth = typeof node.style?.width === 'number' ? node.style.width : undefined;
  const styleHeight = typeof node.style?.height === 'number' ? node.style.height : undefined;
  const width = typeof node.width === 'number' ? node.width : styleWidth ?? DEFAULT_NODE_WIDTH;
  const height = typeof node.height === 'number' ? node.height : styleHeight ?? DEFAULT_NODE_HEIGHT;
  return { width, height };
}

function getNodeBox(node: FlowNode): {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
} {
  const { width, height } = resolveNodeSize(node);
  const left = node.position.x;
  const top = node.position.y;
  const right = left + width;
  const bottom = top + height;
  return {
    left,
    right,
    top,
    bottom,
    centerX: left + width / 2,
    centerY: top + height / 2,
  };
}

function updateNearestGuide(
  currentGuide: { position: number | null; delta: number },
  candidatePosition: number,
  delta: number
): { position: number | null; delta: number } {
  if (delta < currentGuide.delta) {
    return { position: candidatePosition, delta };
  }
  return currentGuide;
}

export function computeAlignmentGuides(
  draggedNode: FlowNode,
  allNodes: FlowNode[],
  threshold = 8
): AlignmentGuides {
  const draggedBox = getNodeBox(draggedNode);
  let vertical = { position: null as number | null, delta: Number.POSITIVE_INFINITY };
  let horizontal = { position: null as number | null, delta: Number.POSITIVE_INFINITY };

  const candidates = allNodes.filter((node) => node.id !== draggedNode.id && !node.hidden);
  candidates.forEach((node) => {
    const nodeBox = getNodeBox(node);
    const verticalCandidates = [nodeBox.left, nodeBox.centerX, nodeBox.right];
    const horizontalCandidates = [nodeBox.top, nodeBox.centerY, nodeBox.bottom];

    verticalCandidates.forEach((candidateX) => {
      const delta = Math.abs(candidateX - draggedBox.centerX);
      if (delta <= threshold) {
        vertical = updateNearestGuide(vertical, candidateX, delta);
      }
    });

    horizontalCandidates.forEach((candidateY) => {
      const delta = Math.abs(candidateY - draggedBox.centerY);
      if (delta <= threshold) {
        horizontal = updateNearestGuide(horizontal, candidateY, delta);
      }
    });
  });

  return {
    verticalFlowX: vertical.position,
    horizontalFlowY: horizontal.position,
  };
}
