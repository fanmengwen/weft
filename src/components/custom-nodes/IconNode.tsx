import React, { memo } from 'react';
import { Handle, Position } from '@/lib/reactflowCompat';
import type { LegacyNodeProps } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { HelpCircle } from 'lucide-react';
import { NamedIcon } from '../IconMap';
import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import { getHandlePointerEvents, getV2HandleVisibilityClass } from '@/components/handleInteraction';
import { NodeTransformControls } from '@/components/NodeTransformControls';

function IconNode({ data, selected }: LegacyNodeProps<NodeData>): React.ReactElement {
    const visualQualityV2Enabled = ROLLOUT_FLAGS.visualQualityV2;
    const handlePointerEvents = getHandlePointerEvents(visualQualityV2Enabled, Boolean(selected));
    const handleVisibilityClass = visualQualityV2Enabled
        ? getV2HandleVisibilityClass(Boolean(selected), { includeConnectingState: false })
        : selected
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100 [.is-connecting_&]:opacity-100';
    const iconName = data.label || 'HelpCircle';

    // Size logic could be enhanced, default to 48 for good visibility
    const size = 48;
    const color = data.color || 'slate';

    // Map color names to tailwind classes if needed, or use inline styles 
    // For now simple mapping
    const colorMap: Record<string, string> = {
        slate: 'text-slate-600',
        blue: 'text-blue-600',
        red: 'text-red-600',
        green: 'text-green-600',
        emerald: 'text-emerald-600',
        amber: 'text-amber-600',
        purple: 'text-purple-600',
        pink: 'text-pink-600',
    };
    const textColor = colorMap[color] || 'text-slate-600';

    return (
        <>
            <NodeTransformControls
                isVisible={Boolean(selected)}
                minWidth={48}
                minHeight={48}
                keepAspectRatio
            />
            <div className={`relative p-2 rounded flex items-center justify-center
                ${selected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                ${textColor}
            `}>
                <Handle type="source" position={Position.Top} isConnectableStart isConnectableEnd className={`!w-3 !h-3 !border-2 !border-white bg-current ${handleVisibilityClass}`} style={{ pointerEvents: handlePointerEvents }} />
                <Handle type="source" position={Position.Left} isConnectableStart isConnectableEnd className={`!w-3 !h-3 !border-2 !border-white bg-current ${handleVisibilityClass}`} style={{ pointerEvents: handlePointerEvents }} />

                {iconName ? (
                    <NamedIcon name={iconName} fallbackName="HelpCircle" size={size} strokeWidth={1.5} />
                ) : (
                    <HelpCircle size={size} strokeWidth={1.5} />
                )}

                <Handle type="source" position={Position.Right} isConnectableStart isConnectableEnd className={`!w-3 !h-3 !border-2 !border-white bg-current ${handleVisibilityClass}`} style={{ pointerEvents: handlePointerEvents }} />
                <Handle type="source" position={Position.Bottom} isConnectableStart isConnectableEnd className={`!w-3 !h-3 !border-2 !border-white bg-current ${handleVisibilityClass}`} style={{ pointerEvents: handlePointerEvents }} />
            </div>
        </>
    );
}

export default memo(IconNode);
