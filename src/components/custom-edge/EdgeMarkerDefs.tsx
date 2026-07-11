import React from 'react';

interface EdgeMarkerDefsProps {
  standardMarkers: {
    defs: Array<{ id: string; width: number; height: number; side: string; color: string }>;
  };
}

export function EdgeMarkerDefs({ standardMarkers }: EdgeMarkerDefsProps): React.ReactElement {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {standardMarkers.defs.map((markerDef) => (
          <marker
            key={markerDef.id}
            id={markerDef.id}
            markerWidth={markerDef.width}
            markerHeight={markerDef.height}
            refX={markerDef.side === 'end' ? markerDef.width - 1 : 1}
            refY={markerDef.height / 2}
            orient={markerDef.side === 'start' ? 'auto-start-reverse' : 'auto'}
            markerUnits="userSpaceOnUse"
          >
            <path
              d={`M0,0 L${markerDef.width},${markerDef.height / 2} L0,${markerDef.height} z`}
              fill={markerDef.color}
            />
          </marker>
        ))}
      </defs>
    </svg>
  );
}
