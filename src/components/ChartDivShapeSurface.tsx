import React from 'react';
import type { DesignSystem } from '@/lib/types';
import type { NodeShape } from './nodeHelpers';
import { ChartDatabaseSurface } from './ChartDatabaseSurface';
import { ChartDecisionSurface } from './ChartDecisionSurface';
import { ChartIoSurface } from './ChartIoSurface';

interface ChartDivShapeRouterProps {
  shape: NodeShape;
  designSystem: DesignSystem;
  isSelected: boolean;
  surfaceClassName: string;
  diagnosticsAttrs: Record<string, string | number | undefined>;
  ariaLabel: string;
  children: React.ReactNode;
}

export function ChartDivShapeSurface({
  shape,
  designSystem,
  isSelected,
  surfaceClassName,
  diagnosticsAttrs,
  ariaLabel,
  children,
}: ChartDivShapeRouterProps): React.ReactElement {
  if (shape === 'diamond') {
    return (
      <ChartDecisionSurface
        designSystem={designSystem}
        isSelected={isSelected}
        surfaceClassName={surfaceClassName}
        diagnosticsAttrs={diagnosticsAttrs}
        ariaLabel={ariaLabel}
      >
        {children}
      </ChartDecisionSurface>
    );
  }

  if (shape === 'parallelogram') {
    return (
      <ChartIoSurface
        designSystem={designSystem}
        isSelected={isSelected}
        surfaceClassName={surfaceClassName}
        diagnosticsAttrs={diagnosticsAttrs}
        ariaLabel={ariaLabel}
      >
        {children}
      </ChartIoSurface>
    );
  }

  return (
    <ChartDatabaseSurface
      designSystem={designSystem}
      isSelected={isSelected}
      diagnosticsAttrs={diagnosticsAttrs}
      ariaLabel={ariaLabel}
    >
      {children}
    </ChartDatabaseSurface>
  );
}
