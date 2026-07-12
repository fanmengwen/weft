import React from 'react';
import { Handle, Position } from '@/lib/reactflowCompat';
import {
  getChartHandleClassName,
  getConnectorHandleStyle,
  getHandlePointerEvents,
  getV2HandleVisibilityClass,
} from '@/components/handleInteraction';

interface StructuredNodeHandlesProps {
  isActiveSelected: boolean;
}

const HANDLE_POSITIONS = [
  { id: 'top', position: Position.Top },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
  { id: 'right', position: Position.Right },
] as const;

export function StructuredNodeHandles({
  isActiveSelected,
}: StructuredNodeHandlesProps): React.ReactElement {
  const handlePointerEvents = getHandlePointerEvents(true, isActiveSelected);
  const handleVisibilityClass = getV2HandleVisibilityClass(isActiveSelected);

  return (
    <>
      {HANDLE_POSITIONS.map(({ id, position }) => (
        <Handle
          key={id}
          type="source"
          position={position}
          id={id}
          isConnectableStart
          isConnectableEnd
          className={`${getChartHandleClassName(id)} ${handleVisibilityClass}`}
          style={getConnectorHandleStyle(id, isActiveSelected, handlePointerEvents)}
        />
      ))}
    </>
  );
}
