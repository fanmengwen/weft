import { describe, expect, it } from 'vitest';
import type { FlowNode } from '@/lib/types';
import { computeAlignmentGuides } from './alignmentGuides';

function createNode(id: string, x: number, y: number): FlowNode {
  return {
    id,
    type: 'process',
    position: { x, y },
    data: { label: id, color: 'slate' },
    width: 180,
    height: 96,
  };
}

describe('alignmentGuides', () => {
  it('returns nearest vertical and horizontal guides when within threshold', () => {
    const dragged = createNode('dragged', 100, 100);
    const alignedX = createNode('aligned-x', 100, 300);
    const alignedY = createNode('aligned-y', 400, 100);

    const guides = computeAlignmentGuides(dragged, [dragged, alignedX, alignedY], 8);

    expect(guides.verticalFlowX).toBe(190);
    expect(guides.horizontalFlowY).toBe(148);
  });

  it('returns null guides when no candidate is near enough', () => {
    const dragged = createNode('dragged', 0, 0);
    const farNode = createNode('far', 500, 500);

    const guides = computeAlignmentGuides(dragged, [dragged, farNode], 6);

    expect(guides.verticalFlowX).toBeNull();
    expect(guides.horizontalFlowY).toBeNull();
  });
});
