import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReactFlow, useViewport } from '@/lib/reactflowCompat';

const controlButtonClassName =
  'flex h-8 w-8 items-center justify-center rounded-[var(--brand-radius)] text-[var(--brand-secondary)] transition-colors hover:bg-[var(--brand-glass-bg)] hover:text-[var(--brand-text)] active:scale-95';

export function WorkflowZoomControls(): React.ReactElement {
  const { t } = useTranslation();
  const { zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();

  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 z-10">
      <div className="flex items-center gap-0.5 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] px-1 py-1 shadow-[var(--shadow-md)] backdrop-blur-[var(--brand-glass-blur)]">
        <button
          type="button"
          aria-label={t('navigationControls.zoomOut')}
          title={t('navigationControls.zoomOut')}
          onClick={() => zoomOut({ duration: 200 })}
          className={controlButtonClassName}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-[3rem] select-none px-1 text-center text-xs font-medium tabular-nums text-[var(--brand-secondary)]">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          aria-label={t('navigationControls.zoomIn')}
          title={t('navigationControls.zoomIn')}
          onClick={() => zoomIn({ duration: 200 })}
          className={controlButtonClassName}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
