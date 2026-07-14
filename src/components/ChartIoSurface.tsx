import React from 'react';
import { buildChartDivSurfaceStyle, type ChartDivShapeSurfaceProps } from './chartDivShapeStyles';

export function ChartIoSurface({
  designSystem,
  isSelected,
  surfaceClassName,
  diagnosticsAttrs,
  ariaLabel,
  children,
}: ChartDivShapeSurfaceProps): React.ReactElement {
  const surfaceStyle = buildChartDivSurfaceStyle({
    designSystem,
    isSelected,
    borderRadius: '10px',
  });

  return (
    <div
      role="group"
      aria-roledescription="canvas node"
      aria-label={ariaLabel}
      data-chart-div-shape="io"
      data-transform-diagnostics="1"
      className={`relative transition-all duration-200 ${surfaceClassName}`}
      style={{
        ...surfaceStyle,
        transform: 'skewX(-12deg)',
        padding: '10px 20px',
        minHeight: 'inherit',
        width: '100%',
        height: '100%',
      }}
      {...diagnosticsAttrs}
    >
      <div data-chart-shape-upright="1" style={{ transform: 'skewX(12deg)' }}>
        {children}
      </div>
    </div>
  );
}
