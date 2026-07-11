import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReactFlow, useViewport } from '@/lib/reactflowCompat';

const controlButtonClassName =
  'flex h-[26px] w-7 items-center justify-center text-[var(--wf-text-label)] transition-colors hover:bg-[var(--wf-hover)]';

// Segmented [− | % | +] group; the workflow status bar decides where it sits.
export function WorkflowZoomControls(): React.ReactElement {
  const { t } = useTranslation();
  const { zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();

  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-[var(--wf-border)] bg-white">
      <button
        type="button"
        aria-label={t('navigationControls.zoomOut')}
        title={t('navigationControls.zoomOut')}
        onClick={() => zoomOut({ duration: 200 })}
        className={controlButtonClassName}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-[46px] select-none border-x border-[var(--wf-hairline)] text-center text-xs leading-[26px] tabular-nums text-[var(--wf-text-mid)]">
        {Math.round(zoom * 100)}%
      </span>
      <button
        type="button"
        aria-label={t('navigationControls.zoomIn')}
        title={t('navigationControls.zoomIn')}
        onClick={() => zoomIn({ duration: 200 })}
        className={controlButtonClassName}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
