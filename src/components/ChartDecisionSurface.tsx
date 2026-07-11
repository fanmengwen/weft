import React from 'react';
import { buildChartDivSurfaceStyle, type ChartDivShapeSurfaceProps } from './chartDivShapeStyles';

export function ChartDecisionSurface({
  designSystem,
  isSelected,
  surfaceClassName,
  diagnosticsAttrs,
  ariaLabel,
  children,
}: ChartDivShapeSurfaceProps): React.ReactElement {
  const rotorStyle = buildChartDivSurfaceStyle({
    designSystem,
    isSelected,
    borderRadius: '15px',
  });

  return (
    <div
      role="group"
      aria-roledescription="canvas node"
      aria-label={ariaLabel}
      data-chart-div-shape="diamond"
      data-transform-diagnostics="1"
      className="relative"
      style={{
        width: '148px',
        height: '148px',
        minWidth: '148px',
        minHeight: '148px',
      }}
      {...diagnosticsAttrs}
    >
      <div
        data-chart-shape-rotor="1"
        className={`absolute transition-all duration-200 ${surfaceClassName}`}
        style={{
          ...rotorStyle,
          inset: '16px',
          transform: 'rotate(45deg)',
        }}
      />
      <div
        data-chart-shape-upright="1"
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={{ transform: 'rotate(-45deg)' }}
      >
        {children}
      </div>
    </div>
  );
}


