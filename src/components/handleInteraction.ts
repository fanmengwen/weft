import type { CSSProperties } from 'react';

export type HandleSide = 'top' | 'right' | 'bottom' | 'left';

export const CHART_HANDLE_SIZE_PX = 11;

const SOURCE_PORT_SHADOW = '0 1px 3px rgba(16, 24, 40, 0.2)';

export function getHandlePointerEvents(_visualQualityV2Enabled: boolean, _selected: boolean): 'none' | 'all' {
  return 'all';
}

export function getV2HandleVisibilityClass(
  selected: boolean,
  options: { includeConnectingState?: boolean; includeScale?: boolean } = {}
): string {
  const includeConnectingState = options.includeConnectingState ?? true;
  const includeScale = options.includeScale ?? true;

  // Keep anchors visible but secondary to resize controls while selected.
  const selectedVisibility = includeScale ? 'opacity-80 scale-100' : 'opacity-80';
  const connectingClass = includeConnectingState ? ' [.is-connecting_&]:opacity-100' : '';
  const hitAreaClass = selected ? '' : ' flow-handle-hitarea';
  return `${selected ? selectedVisibility : 'opacity-0'} group-hover:opacity-100${connectingClass}${hitAreaClass}`.trim();
}

export function isTargetHandleSide(side: HandleSide): boolean {
  return side === 'left';
}

export function getChartHandleClassName(side: HandleSide): string {
  const role = isTargetHandleSide(side) ? 'target' : 'source';
  return `chart-handle chart-handle--${role} chart-handle--${side}`;
}

function getChartHandleVisualStyle(side: HandleSide): CSSProperties {
  if (isTargetHandleSide(side)) {
    return {
      width: CHART_HANDLE_SIZE_PX,
      height: CHART_HANDLE_SIZE_PX,
      borderRadius: '50%',
      backgroundColor: '#FFFFFF',
      border: '2px solid #C6CCD6',
      boxShadow: 'none',
    };
  }

  return {
    width: CHART_HANDLE_SIZE_PX,
    height: CHART_HANDLE_SIZE_PX,
    borderRadius: '50%',
    backgroundColor: 'var(--wf-acc)',
    border: '2px solid #FFFFFF',
    boxShadow: SOURCE_PORT_SHADOW,
  };
}

export function getConnectorHandleStyle(
  position: HandleSide,
  _selected: boolean,
  pointerEvents: 'none' | 'all',
  extra?: CSSProperties
): CSSProperties {
  const baseByPosition: Record<HandleSide, CSSProperties> = {
    top: {
      left: '50%',
      top: 0,
      transform: 'translate(-50%, -50%)',
    },
    right: {
      top: '50%',
      left: '100%',
      transform: 'translate(-50%, -50%)',
    },
    bottom: {
      left: '50%',
      top: '100%',
      transform: 'translate(-50%, -50%)',
    },
    left: {
      top: '50%',
      left: 0,
      transform: 'translate(-50%, -50%)',
    },
  };

  return {
    ...baseByPosition[position],
    ...getChartHandleVisualStyle(position),
    ...(extra ?? {}),
    zIndex: 100,
    pointerEvents,
  };
}
