import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReactFlow, useViewport } from '@/lib/reactflowCompat';

const controlButtonClassName =
  'flex h-[26px] w-7 items-center justify-center text-[var(--wf-text-label)] transition-colors hover:bg-[var(--wf-hover)]';

// Flat 20% zoom steps snapped to the grid (a wheel-zoomed 85% steps up to
// 100%, down to 80%), clamped to the canvas 20%–200% range.
const ZOOM_STEP = 0.2;
const ZOOM_MIN = 0.2;
const ZOOM_MAX = 2;
const EPS = 1e-6;

// Segmented [− | % | +] group; the workflow status bar decides where it sits.
export function WorkflowZoomControls(): React.ReactElement {
  const { t } = useTranslation();
  const { zoomTo } = useReactFlow();
  const { zoom } = useViewport();

  const stepZoom = (direction: 1 | -1) => {
    const next =
      direction === 1
        ? (Math.floor(zoom / ZOOM_STEP + EPS) + 1) * ZOOM_STEP
        : (Math.ceil(zoom / ZOOM_STEP - EPS) - 1) * ZOOM_STEP;
    zoomTo(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next)), { duration: 200 });
  };

  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-[var(--wf-border)] bg-white">
      <button
        type="button"
        aria-label={t('navigationControls.zoomOut')}
        title={t('navigationControls.zoomOut')}
        onClick={() => stepZoom(-1)}
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
        onClick={() => stepZoom(1)}
        className={controlButtonClassName}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
