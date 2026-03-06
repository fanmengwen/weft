import React, { memo } from 'react';
import { Handle, Position } from '@/lib/reactflowCompat';
import type { LegacyNodeProps } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import { getNodeColorPalette } from '../theme';
import { getConnectorHandleStyle, getHandlePointerEvents, getV2HandleVisibilityClass } from './handleInteraction';
import { NodeTransformControls } from './NodeTransformControls';

const HANDLE_POSITIONS: Array<{
    id: string;
    position: Position;
    side: 'top' | 'right' | 'bottom' | 'left';
}> = [
    { id: 'top', position: Position.Top, side: 'top' },
    { id: 'right', position: Position.Right, side: 'right' },
    { id: 'bottom', position: Position.Bottom, side: 'bottom' },
    { id: 'left', position: Position.Left, side: 'left' },
];

function ImageNode({ data, selected }: LegacyNodeProps<NodeData>): React.ReactElement {
    // Default styles
    const visualQualityV2Enabled = ROLLOUT_FLAGS.visualQualityV2;
    const nodeColorPalette = getNodeColorPalette(visualQualityV2Enabled);
    const style = nodeColorPalette.slate;
    const handlePointerEvents = getHandlePointerEvents(visualQualityV2Enabled, Boolean(selected));
    const handleVisibilityClass = visualQualityV2Enabled
        ? getV2HandleVisibilityClass(Boolean(selected))
        : selected
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100 [.is-connecting_&]:opacity-100';

    return (
        <>
            <NodeTransformControls
                isVisible={Boolean(selected)}
                minWidth={50}
                minHeight={50}
                keepAspectRatio
            />

            <div
                className={`relative group flex flex-col justify-center h-full transition-all duration-200
                    ${selected && !visualQualityV2Enabled ? 'ring-2 ring-[var(--brand-primary)] ring-offset-4' : ''}
                `}
                style={{
                    width: '100%',
                    height: '100%',
                    opacity: data.transparency ?? 1,
                    transform: data.rotation ? `rotate(${data.rotation}deg)` : 'none',
                    boxShadow: selected && visualQualityV2Enabled ? '0 0 0 2px #6366f1, 0 0 12px rgba(99,102,241,0.2)' : undefined,
                }}
            >
                {data.imageUrl ? (
                    <img
                        src={data.imageUrl}
                        alt={data.label || 'Image Node'}
                        className="w-full h-full object-contain pointer-events-none select-none"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 rounded-lg">
                        <span className="text-xs">No Image</span>
                    </div>
                )}
            </div>

            {/* Universal Handles - Allow connections */}
            {/* Hidden by default, visible on hover/connect */}
            {HANDLE_POSITIONS.map(({ id, position, side }) => (
                <Handle
                    key={id}
                    type="source"
                    position={position}
                    id={id}
                    isConnectableStart
                    isConnectableEnd
                    className={`!w-3 !h-3 !border-2 !border-white ${style.handle} transition-all duration-150 hover:scale-125 ${handleVisibilityClass}`}
                    style={getConnectorHandleStyle(side, Boolean(selected), handlePointerEvents)}
                />
            ))}
        </>
    );
}

export default memo(ImageNode);
