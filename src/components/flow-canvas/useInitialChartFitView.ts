import { useEffect, useRef } from 'react';

export type InitialFitViewFn = (options?: {
  duration?: number;
  padding?: number;
  minZoom?: number;
  maxZoom?: number;
}) => void;

/**
 * Center the chart once per tab open/refresh so persisted graphs do not sit
 * at the top-left under the default viewport (x:0,y:0). Zoom is preserved.
 */
export function useInitialChartFitView({
  fitView,
  getZoom,
  activeTabId,
  nodeCount,
  delayMs = 50,
}: {
  fitView: InitialFitViewFn;
  getZoom: () => number;
  activeTabId: string | null;
  nodeCount: number;
  delayMs?: number;
}): void {
  const fittedTabRef = useRef<string | null>(null);

  useEffect(() => {
    if (nodeCount === 0) {
      return;
    }

    const tabKey = activeTabId ?? '__default__';
    if (fittedTabRef.current === tabKey) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (fittedTabRef.current === tabKey) {
        return;
      }
      fittedTabRef.current = tabKey;
      const zoom = getZoom();
      fitView({
        padding: 0.2,
        duration: 0,
        minZoom: zoom,
        maxZoom: zoom,
      });
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeTabId, delayMs, fitView, getZoom, nodeCount]);
}
