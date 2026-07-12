import type { CSSProperties } from 'react';

export type HandleSide = 'top' | 'right' | 'bottom' | 'left';

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
    ...(extra ?? {}),
    zIndex: 100,
    pointerEvents,
  };
}
