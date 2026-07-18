import React, { useMemo } from 'react';
import type { WorkspaceDocumentPreview } from '@/store/workspaceDocumentModel';
import { DesignFlowPreview } from './previews/DesignFlowPreview';
import type { DesignPreviewGraph } from './previews/designFlowPreviewModel';
import { toneFromNodeType } from './previews/designFlowPreviewModel';

export function HomeFlowPreview({
  preview,
}: {
  preview: WorkspaceDocumentPreview | null;
}): React.ReactElement {
  const graph = useMemo(() => graphFromWorkspacePreview(preview), [preview]);

  if (!graph || graph.nodes.length === 0) {
    return (
      <div
        className="absolute inset-0 bg-[#F6F7F9]"
        style={{
          backgroundImage: 'radial-gradient(circle, #DEE1E7 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />
    );
  }

  return <DesignFlowPreview graph={graph} density="card" />;
}

function graphFromWorkspacePreview(
  preview: WorkspaceDocumentPreview | null
): DesignPreviewGraph | null {
  if (!preview || preview.nodes.length === 0) {
    return null;
  }

  const nodes = preview.nodes
    .filter((node) => node.type !== 'annotation')
    .slice(0, 12)
    .map((node) => {
      const tone = toneFromNodeType(node.type);
      const kind =
        tone === 'decision' || node.shape === 'diamond'
          ? ('diamond' as const)
          : tone === 'start' || tone === 'end' || node.shape === 'capsule'
            ? ('capsule' as const)
            : ('rect' as const);
      return {
        id: node.id,
        x: node.x,
        y: node.y,
        width: Math.min(Math.max(node.width, 72), 148),
        height:
          kind === 'diamond'
            ? Math.min(Math.max(Math.max(node.width, node.height) * 0.55, 56), 88)
            : Math.min(Math.max(node.height, 28), 44),
        label: shorten(node.label ?? node.type ?? '节点'),
        tone,
        kind,
      };
    });

  const ids = new Set(nodes.map((node) => node.id));
  const edges = (preview.edges ?? [])
    .filter((edge) => ids.has(edge.source) && ids.has(edge.target))
    .slice(0, 16)
    .map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
    }));

  return { nodes, edges };
}

function shorten(label: string): string {
  const compact = label.replace(/\s+/g, ' ').trim();
  if (compact.length <= 10) {
    return compact;
  }
  return `${compact.slice(0, 9)}…`;
}
