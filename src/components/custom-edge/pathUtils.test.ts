import { describe, expect, it } from 'vitest';
import { Position } from '@/lib/reactflowCompat';
import { buildEdgePath } from './pathUtils';

function getMovePoint(path: string): string {
  const match = path.match(/^M\s*([0-9.-]+)\s+([0-9.-]+)/);
  if (!match) {
    throw new Error(`Missing move point in path: ${path}`);
  }

  return `${match[1]},${match[2]}`;
}

function getMoveY(path: string): number {
  const [, y] = getMovePoint(path).split(',');
  return Number(y);
}

describe('buildEdgePath', () => {
  it('routes edge through explicit waypoint when provided', () => {
    const result = buildEdgePath(
      {
        id: 'edge-1',
        source: 'a',
        target: 'b',
        sourceX: 0,
        sourceY: 0,
        targetX: 100,
        targetY: 100,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      [],
      'smoothstep',
      {
        waypoint: { x: 40, y: 60 },
      }
    );

    expect(result.edgePath).toContain('L 40 60');
    expect(result.edgePath.startsWith('M ')).toBe(true);
    expect(Number.isFinite(result.labelX)).toBe(true);
    expect(Number.isFinite(result.labelY)).toBe(true);
  });

  it('fans out edges that share the same node side', () => {
    const allEdges = [
      { id: 'edge-1', source: 'a', target: 'b', sourceHandle: 'right', targetHandle: 'left' },
      { id: 'edge-2', source: 'a', target: 'c', sourceHandle: 'right', targetHandle: 'left' },
      { id: 'edge-3', source: 'a', target: 'd', sourceHandle: 'right', targetHandle: 'left' },
    ];

    const first = buildEdgePath(
      {
        id: 'edge-1',
        source: 'a',
        target: 'b',
        sourceX: 100,
        sourceY: 100,
        targetX: 260,
        targetY: 40,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        sourceHandleId: 'right',
        targetHandleId: 'left',
      },
      allEdges,
      'smoothstep'
    );

    const second = buildEdgePath(
      {
        id: 'edge-2',
        source: 'a',
        target: 'c',
        sourceX: 100,
        sourceY: 100,
        targetX: 260,
        targetY: 100,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        sourceHandleId: 'right',
        targetHandleId: 'left',
      },
      allEdges,
      'smoothstep'
    );

    const third = buildEdgePath(
      {
        id: 'edge-3',
        source: 'a',
        target: 'd',
        sourceX: 100,
        sourceY: 100,
        targetX: 260,
        targetY: 160,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        sourceHandleId: 'right',
        targetHandleId: 'left',
      },
      allEdges,
      'smoothstep'
    );

    expect(getMovePoint(first.edgePath)).not.toBe('100,100');
    expect(getMovePoint(second.edgePath)).toBe('100,100');
    expect(getMovePoint(third.edgePath)).not.toBe('100,100');
    expect(getMovePoint(first.edgePath)).not.toBe(getMovePoint(third.edgePath));
  });

  it('increases fan-out spacing for denser side bundles', () => {
    const sparseEdges = [
      { id: 's1', source: 'a', target: 'b', sourceHandle: 'right', targetHandle: 'left' },
      { id: 's2', source: 'a', target: 'c', sourceHandle: 'right', targetHandle: 'left' },
      { id: 's3', source: 'a', target: 'd', sourceHandle: 'right', targetHandle: 'left' },
    ];
    const denseEdges = [
      { id: 'd1', source: 'a', target: 'b', sourceHandle: 'right', targetHandle: 'left' },
      { id: 'd2', source: 'a', target: 'c', sourceHandle: 'right', targetHandle: 'left' },
      { id: 'd3', source: 'a', target: 'd', sourceHandle: 'right', targetHandle: 'left' },
      { id: 'd4', source: 'a', target: 'e', sourceHandle: 'right', targetHandle: 'left' },
      { id: 'd5', source: 'a', target: 'f', sourceHandle: 'right', targetHandle: 'left' },
    ];

    const sparseOuter = buildEdgePath(
      {
        id: 's1',
        source: 'a',
        target: 'b',
        sourceX: 100,
        sourceY: 100,
        targetX: 260,
        targetY: 40,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        sourceHandleId: 'right',
        targetHandleId: 'left',
      },
      sparseEdges,
      'smoothstep'
    );

    const denseOuter = buildEdgePath(
      {
        id: 'd1',
        source: 'a',
        target: 'b',
        sourceX: 100,
        sourceY: 100,
        targetX: 260,
        targetY: 40,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        sourceHandleId: 'right',
        targetHandleId: 'left',
      },
      denseEdges,
      'smoothstep'
    );

    expect(Math.abs(getMoveY(denseOuter.edgePath) - 100)).toBeGreaterThan(Math.abs(getMoveY(sparseOuter.edgePath) - 100));
  });

  it('nudges labels away from the center line for same-side bundles', () => {
    const allEdges = [
      { id: 'edge-1', source: 'a', target: 'b', sourceHandle: 'right', targetHandle: 'left' },
      { id: 'edge-2', source: 'a', target: 'c', sourceHandle: 'right', targetHandle: 'left' },
      { id: 'edge-3', source: 'a', target: 'd', sourceHandle: 'right', targetHandle: 'left' },
    ];

    const first = buildEdgePath(
      {
        id: 'edge-1',
        source: 'a',
        target: 'b',
        sourceX: 100,
        sourceY: 100,
        targetX: 260,
        targetY: 40,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        sourceHandleId: 'right',
        targetHandleId: 'left',
      },
      allEdges,
      'smoothstep'
    );

    const second = buildEdgePath(
      {
        id: 'edge-2',
        source: 'a',
        target: 'c',
        sourceX: 100,
        sourceY: 100,
        targetX: 260,
        targetY: 100,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        sourceHandleId: 'right',
        targetHandleId: 'left',
      },
      allEdges,
      'smoothstep'
    );

    expect(first.labelY).not.toBe(second.labelY);
    expect(Math.abs(first.labelY - second.labelY)).toBeGreaterThan(4);
  });
});
