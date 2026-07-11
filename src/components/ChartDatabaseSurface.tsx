import React from 'react';
import {
  buildChartDatabaseBodyStyle,
  buildChartDatabaseCapStyle,
  CHART_DATABASE_DROP_SHADOW,
  type ChartDatabaseSurfaceProps,
} from './chartDivShapeStyles';

export function ChartDatabaseSurface({
  designSystem,
  isSelected,
  diagnosticsAttrs,
  ariaLabel,
  children,
}: ChartDatabaseSurfaceProps): React.ReactElement {
  const capStyle = buildChartDatabaseCapStyle({ designSystem, isSelected });
  const bodyStyle = buildChartDatabaseBodyStyle({ designSystem, isSelected });

  return (
    <div
      role="group"
      aria-roledescription="canvas node"
      aria-label={ariaLabel}
      data-chart-div-shape="database"
      data-transform-diagnostics="1"
      className="relative w-full"
      style={{ filter: CHART_DATABASE_DROP_SHADOW, minHeight: 'inherit' }}
      {...diagnosticsAttrs}
    >
      <div data-chart-database-cap="1" style={capStyle} />
      <div data-chart-database-body="1" style={bodyStyle}>
        <div data-chart-shape-upright="1">{children}</div>
      </div>
    </div>
  );
}
