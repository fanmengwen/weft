import React, { useMemo } from 'react';
import type { WorkspaceDocumentPreview } from '@/store/workspaceDocumentModel';
import type { DocumentKind } from '../documentKindStorage';
import { DesignFlowPreview } from '../previews/DesignFlowPreview';
import type { DesignPreviewGraph } from '../previews/designFlowPreviewModel';
import { toneFromNodeType } from '../previews/designFlowPreviewModel';

interface FilesCompactPreviewProps {
  kind: DocumentKind;
  preview: WorkspaceDocumentPreview | null;
}

/** Compact strip between kind badge and overflow menu (design ~150×52). */
export function FilesCompactPreview({
  kind,
  preview,
}: FilesCompactPreviewProps): React.ReactElement {
  const graph = useMemo(() => graphFromWorkspacePreview(preview, kind), [preview, kind]);

  if (!graph || graph.nodes.length === 0) {
    return kind === 'workflow' ? <StaticWorkflowPreview /> : <StaticChartPreview />;
  }

  return (
    <div className="relative mx-auto h-[52px] w-[150px] shrink-0 overflow-hidden rounded-md">
      <DesignFlowPreview graph={graph} density="compact" showDotGrid={false} />
    </div>
  );
}

function graphFromWorkspacePreview(
  preview: WorkspaceDocumentPreview | null,
  kind: DocumentKind
): DesignPreviewGraph | null {
  if (!preview || preview.nodes.length === 0) {
    return null;
  }

  const nodes = preview.nodes
    .filter((node) => node.type !== 'annotation')
    .slice(0, 5)
    .map((node) => {
      const tone =
        kind === 'workflow' && (!node.type || node.type === 'process')
          ? ('process' as const)
          : toneFromNodeType(node.type);
      const kindShape =
        tone === 'decision' || node.shape === 'diamond'
          ? ('diamond' as const)
          : tone === 'start' || tone === 'end' || node.shape === 'capsule'
            ? ('capsule' as const)
            : ('rect' as const);
      return {
        id: node.id,
        x: node.x,
        y: node.y,
        width: Math.min(Math.max(node.width * 0.55, 56), 96),
        height: kindShape === 'diamond' ? 48 : 26,
        label: shorten(node.label ?? '节点', 6),
        tone,
        kind: kindShape,
      };
    });

  const ids = new Set(nodes.map((node) => node.id));
  const edges = (preview.edges ?? [])
    .filter((edge) => ids.has(edge.source) && ids.has(edge.target))
    .slice(0, 8)
    .map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    }));

  return { nodes, edges };
}

function shorten(label: string, max: number): string {
  const compact = label.replace(/\s+/g, ' ').trim();
  if (compact.length <= max) {
    return compact;
  }
  return `${compact.slice(0, max - 1)}…`;
}

function StaticChartPreview(): React.ReactElement {
  return (
    <svg width="150" height="52" viewBox="0 0 150 52" className="mx-auto block shrink-0" aria-hidden="true">
      <rect x="4" y="19" width="36" height="14" rx="7" fill="#FFFFFF" stroke="#C9CED8" strokeWidth="1.5" />
      <path d="M40 26 H61" stroke="#C9CED8" strokeWidth="1.5" fill="none" />
      <path
        d="M75 15 L86 26 L75 37 L64 26 Z"
        fill="#FFFFFF"
        stroke="#C9CED8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M89 26 H110" stroke="#C9CED8" strokeWidth="1.5" fill="none" />
      <rect x="110" y="19" width="36" height="14" rx="7" fill="#FFFFFF" stroke="#C9CED8" strokeWidth="1.5" />
    </svg>
  );
}

function StaticWorkflowPreview(): React.ReactElement {
  return (
    <svg width="150" height="52" viewBox="0 0 150 52" className="mx-auto block shrink-0" aria-hidden="true">
      <rect x="8" y="19" width="36" height="14" rx="4" fill="#FFFFFF" stroke="#C9CED8" strokeWidth="1.5" />
      <path d="M44 26 H56" stroke="#C9CED8" strokeWidth="1.5" fill="none" />
      <rect x="56" y="19" width="36" height="14" rx="4" fill="#FFFFFF" stroke="#C9CED8" strokeWidth="1.5" />
      <path d="M92 26 H104" stroke="#C9CED8" strokeWidth="1.5" fill="none" />
      <rect x="104" y="19" width="36" height="14" rx="4" fill="#FFFFFF" stroke="#C9CED8" strokeWidth="1.5" />
    </svg>
  );
}
