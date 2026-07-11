import React from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@/lib/reactflowCompat';

// Flat workflow edge: soft bezier ending in a small dart-shaped arrowhead
// that shows flow direction. Selection swaps the stroke to the accent and
// lays a wide translucent halo under the line, per the design spec. Inline
// styles win over React Flow's default edge CSS.
//
// Every workflow target handle sits on the node's left side, so the line
// always enters pointing +x and the arrowhead needs no rotation. The visible
// line stops 6px short of the target; the dart fills the gap.
export function WorkflowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps): React.ReactElement {
  const [fullPath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const [linePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX: targetX - 6,
    targetY,
    targetPosition,
  });
  const arrowPath = `M ${targetX + 1} ${targetY} L ${targetX - 9} ${targetY - 3.7} L ${targetX - 7} ${targetY} L ${targetX - 9} ${targetY + 3.7} Z`;
  const color = selected ? 'var(--wf-acc)' : 'var(--wf-edge)';

  return (
    <>
      {selected ? (
        <path
          d={fullPath}
          fill="none"
          stroke="var(--wf-acc)"
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.16}
        />
      ) : null}
      <BaseEdge
        id={id}
        path={linePath}
        style={{
          stroke: color,
          strokeWidth: selected ? 2 : 1.6,
          strokeLinecap: 'round',
        }}
      />
      <path d={arrowPath} fill={color} />
    </>
  );
}
