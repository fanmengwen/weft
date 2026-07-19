import React, { useId, useMemo } from 'react';
import type { DesignPreviewGraph } from './designFlowPreviewModel';
import { layoutGraph } from './designFlowPreviewLayout';
import { PreviewChip } from './DesignPreviewChips';

export type DesignFlowPreviewDensity = 'hero' | 'card' | 'compact';

interface DesignFlowPreviewProps {
  graph: DesignPreviewGraph;
  density?: DesignFlowPreviewDensity;
  className?: string;
  showDotGrid?: boolean;
}

/**
 * Design-matching mini canvas: large readable chips + tinted badges + edges.
 */
export function DesignFlowPreview({
  graph,
  density = 'card',
  className = '',
  showDotGrid = true,
}: DesignFlowPreviewProps): React.ReactElement {
  const layout = useMemo(() => layoutGraph(graph, density), [graph, density]);
  const markerId = useId().replace(/:/g, '');

  if (graph.nodes.length === 0) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        {showDotGrid ? <DotGrid density={density} /> : null}
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {showDotGrid ? <DotGrid density={density} /> : null}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: layout.boundsW,
          height: layout.boundsH,
          transform: `translate(-50%, -50%) scale(${layout.scale})`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          width={layout.boundsW}
          height={layout.boundsH}
          className="pointer-events-none absolute inset-0 overflow-visible"
        >
          <defs>
            <marker
              id={markerId}
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0 0 L7 3.5 L0 7 Z" fill="#C3C9D3" />
            </marker>
          </defs>
          {layout.edges.map((edge) => (
            <path
              key={edge.id}
              d={edge.d}
              fill="none"
              stroke="#C3C9D3"
              strokeWidth={density === 'compact' ? 1.5 : 1.7}
              strokeLinecap="round"
              markerEnd={`url(#${markerId})`}
            />
          ))}
        </svg>

        {layout.edges.map((edge) => {
          if (!edge.label || edge.labelX === undefined || edge.labelY === undefined) {
            return null;
          }
          return (
            <span
              key={`${edge.id}-label`}
              className="absolute z-[1] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#E6E8EC] bg-white px-1.5 py-px text-[10px] font-medium text-[#5C6572] shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
              style={{ left: edge.labelX, top: edge.labelY }}
            >
              {edge.label}
            </span>
          );
        })}

        {layout.nodes.map((node) => (
          <PreviewChip key={node.id} node={node} density={density} />
        ))}
      </div>
    </div>
  );
}

function DotGrid({ density }: { density: DesignFlowPreviewDensity }): React.ReactElement {
  const size = density === 'hero' ? 22 : density === 'card' ? 20 : 16;
  return (
    <div
      className="absolute inset-0 bg-[#F6F7F9] dark:bg-[color-mix(in_srgb,var(--brand-background),white_3%)]"
      style={{
        backgroundImage: 'radial-gradient(circle, #DEE1E7 1px, transparent 1px)',
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}
