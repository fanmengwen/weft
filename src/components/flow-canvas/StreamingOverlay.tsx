import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStreamingState } from '@/hooks/ai-generation/streamingStore';

const NODE_W = 140;
const COLS = 3;

export function StreamingOverlay(): React.ReactElement | null {
  const { t } = useTranslation();
  const { isGenerating, nodes, nodeCount, edgeCount } = useStreamingState();

  if (!isGenerating || nodeCount === 0) return null;

  const countSummary = [
    t('appLoading.nodeCount', { count: nodeCount }),
    edgeCount > 0 ? t('appLoading.edgeCount', { count: edgeCount }) : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="animate-in fade-in zoom-in-95 duration-200 rounded-xl border border-[var(--brand-primary)]/20 bg-[var(--brand-surface)]/90 px-5 py-4 shadow-xl backdrop-blur-md">
        <div className="mb-3 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--brand-primary)] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--brand-primary)]" />
          </span>
          <span className="text-xs font-semibold text-[var(--brand-text)]">
            {t('appLoading.generatingDiagram')}
          </span>
          <span className="text-[11px] text-[var(--brand-secondary)]">{countSummary}</span>
        </div>
        <div className="relative flex flex-wrap gap-1.5" style={{ maxWidth: COLS * (NODE_W + 6) }}>
          {nodes.slice(0, 12).map((node, i) => (
            <div
              key={node.id}
              className="flex items-center gap-1.5 rounded-md border border-[var(--color-brand-border)] bg-[var(--brand-background)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--brand-text)] shadow-sm animate-in fade-in zoom-in-95 duration-150"
              style={{
                animationDelay: `${Math.min(i * 30, 200)}ms`,
                maxWidth: NODE_W,
              }}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-primary)]" />
              <span className="truncate">{node.data?.label || node.id}</span>
            </div>
          ))}
          {nodeCount > 12 && (
            <div className="flex items-center rounded-md border border-dashed border-[var(--color-brand-border)] bg-[var(--brand-background)]/50 px-2.5 py-1.5 text-[10px] text-[var(--brand-secondary)]">
              {t('appLoading.moreNodes', { count: nodeCount - 12 })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
