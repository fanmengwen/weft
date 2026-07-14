import type { CSSProperties, ReactNode } from 'react';
import type { DesignSystem } from '@/lib/types';
import { CHART_NODE_SURFACE_GRADIENT } from './nodeHelpers';

export interface ChartDivShapeSurfaceProps {
  designSystem: DesignSystem;
  isSelected: boolean;
  surfaceClassName: string;
  diagnosticsAttrs: Record<string, string | number | undefined>;
  ariaLabel: string;
  children: ReactNode;
}

export interface ChartDatabaseSurfaceProps {
  designSystem: DesignSystem;
  isSelected: boolean;
  diagnosticsAttrs: Record<string, string | number | undefined>;
  ariaLabel: string;
  children: ReactNode;
}

export function buildChartDivSurfaceStyle(options: {
  designSystem: DesignSystem;
  isSelected: boolean;
  borderRadius: string | number;
}): CSSProperties {
  const { designSystem, isSelected, borderRadius } = options;
  return {
    background: CHART_NODE_SURFACE_GRADIENT,
    borderColor: isSelected ? 'var(--wf-acc)' : designSystem.colors.nodeBorder,
    borderWidth: isSelected ? '1.5px' : designSystem.components.node.borderWidth,
    borderStyle: 'solid',
    boxShadow: isSelected
      ? 'var(--wf-shadow-node-selected)'
      : designSystem.components.node.boxShadow,
    borderRadius,
  };
}

export const CHART_DATABASE_DROP_SHADOW =
  'drop-shadow(0 1px 2px rgba(16,24,40,0.05)) drop-shadow(0 2px 6px rgba(16,24,40,0.04))';

export const CHART_DATABASE_CAP_GRADIENT = 'linear-gradient(180deg, #FFFFFF, #F4F6F8)';

export function buildChartDatabaseCapStyle(options: {
  designSystem: DesignSystem;
  isSelected: boolean;
}): CSSProperties {
  const { designSystem, isSelected } = options;
  return {
    height: '24px',
    borderRadius: '50%',
    background: CHART_DATABASE_CAP_GRADIENT,
    borderWidth: isSelected ? '1.5px' : designSystem.components.node.borderWidth,
    borderStyle: 'solid',
    borderColor: isSelected ? 'var(--wf-acc)' : designSystem.colors.nodeBorder,
  };
}

export function buildChartDatabaseBodyStyle(options: {
  designSystem: DesignSystem;
  isSelected: boolean;
}): CSSProperties {
  const { designSystem, isSelected } = options;
  return {
    marginTop: '-12px',
    borderLeftWidth: isSelected ? '1.5px' : designSystem.components.node.borderWidth,
    borderRightWidth: isSelected ? '1.5px' : designSystem.components.node.borderWidth,
    borderBottomWidth: isSelected ? '1.5px' : designSystem.components.node.borderWidth,
    borderTopWidth: 0,
    borderStyle: 'solid',
    borderColor: isSelected ? 'var(--wf-acc)' : designSystem.colors.nodeBorder,
    borderRadius: '0 0 50% 50% / 0 0 14px 14px',
    background: CHART_NODE_SURFACE_GRADIENT,
    padding: '16px 20px 14px',
  };
}

