import React, { memo } from 'react';
import { Handle, Position } from '@/lib/reactflowCompat';
import type { LegacyNodeProps } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { Image } from 'lucide-react';
import { NamedIcon } from '../IconMap';
import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import { getConnectorHandleStyle, getHandlePointerEvents, getV2HandleVisibilityClass } from '@/components/handleInteraction';
import { NodeTransformControls } from '@/components/NodeTransformControls';

// --- Helper for Handles ---
function DefaultHandles({ selected }: { selected: boolean }) {
    const visualQualityV2Enabled = ROLLOUT_FLAGS.visualQualityV2;
    const handlePointerEvents = getHandlePointerEvents(visualQualityV2Enabled, selected);
    const handleVisibilityClass = visualQualityV2Enabled
        ? getV2HandleVisibilityClass(selected, { includeConnectingState: false })
        : selected
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100 [.is-connecting_&]:opacity-100';

    return (
    <>
        <Handle type="source" position={Position.Top} isConnectableStart isConnectableEnd className={`!w-3 !h-3 !border-2 !border-white !bg-indigo-400 ${handleVisibilityClass}`} style={getConnectorHandleStyle('top', selected, handlePointerEvents)} />
        <Handle type="source" position={Position.Left} isConnectableStart isConnectableEnd className={`!w-3 !h-3 !border-2 !border-white !bg-indigo-400 ${handleVisibilityClass}`} style={getConnectorHandleStyle('left', selected, handlePointerEvents)} />
        <Handle type="source" position={Position.Right} isConnectableStart isConnectableEnd className={`!w-3 !h-3 !border-2 !border-white !bg-indigo-400 ${handleVisibilityClass}`} style={getConnectorHandleStyle('right', selected, handlePointerEvents)} />
        <Handle type="source" position={Position.Bottom} isConnectableStart isConnectableEnd className={`!w-3 !h-3 !border-2 !border-white !bg-indigo-400 ${handleVisibilityClass}`} style={getConnectorHandleStyle('bottom', selected, handlePointerEvents)} />
    </>
    );
}

// --- Wireframe Button ---
export const WireframeButtonNode = memo(({ data, selected }: LegacyNodeProps<NodeData>) => {
    return (
        <>
            <NodeTransformControls isVisible={Boolean(selected)} minWidth={80} minHeight={36} />
            <div className={`relative w-full h-full px-4 py-2 bg-blue-500 rounded text-white font-medium text-sm shadow-sm flex items-center justify-center text-center
                ${selected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                style={{ minWidth: 80, minHeight: 36 }}
            >
                <DefaultHandles selected={Boolean(selected)} />
                {data.label || 'Button'}
            </div>
        </>
    );
});

// --- Wireframe Input ---
export const WireframeInputNode = memo(({ data, selected }: LegacyNodeProps<NodeData>) => {
    return (
        <>
            <NodeTransformControls isVisible={Boolean(selected)} minWidth={120} minHeight={36} />
            <div className={`relative w-full h-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-500 text-sm shadow-sm flex items-center text-left
                 ${selected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                style={{ minWidth: 120, minHeight: 36 }}
            >
                <DefaultHandles selected={Boolean(selected)} />
                {data.label || 'Input field...'}
            </div>
        </>
    );
});

// --- Wireframe Image ---
export const WireframeImageNode = memo(({ data, selected }: LegacyNodeProps<NodeData>) => {
    return (
        <>
            <NodeTransformControls isVisible={Boolean(selected)} minWidth={50} minHeight={50} />
            <div className={`relative bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400 overflow-hidden
                 ${selected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                style={{ width: '100%', height: '100%', minWidth: 50, minHeight: 50 }}
            >
                <DefaultHandles selected={Boolean(selected)} />
                <Image size={24} />
                {data.label && <span className="absolute bottom-1 text-[10px]">{data.label}</span>}
            </div>
        </>
    );
});

// --- Wireframe Icon (Placeholder) ---
// This is different from the specific IconNode which uses the full Lucide library.
// This is for generic wireframing.
export const WireframeIconNode = memo(({ data, selected }: LegacyNodeProps<NodeData>) => {
    const iconName = data.label === 'Icon' ? 'Box' : (data.icon || data.label);

    const color = data.color || 'slate';
    const colorMap: Record<string, string> = {
        slate: 'text-slate-700',
        blue: 'text-blue-500',
        red: 'text-red-500',
        green: 'text-green-500',
        emerald: 'text-emerald-500',
        amber: 'text-amber-500',
        purple: 'text-purple-500',
        pink: 'text-pink-500',
    };
    const textColor = colorMap[color] || 'text-slate-700';

    return (
        <>
            <NodeTransformControls isVisible={Boolean(selected)} minWidth={40} minHeight={40} keepAspectRatio />
            <div className={`relative w-full h-full p-1 flex items-center justify-center ${textColor}
                 ${selected ? 'ring-2 ring-indigo-500 ring-offset-1 rounded' : ''}`}
                style={{ minWidth: 40, minHeight: 40 }}
            >
                <DefaultHandles selected={Boolean(selected)} />
                <NamedIcon name={iconName} fallbackName="Circle" size={32} />
            </div>
        </>
    );
});

WireframeButtonNode.displayName = 'WireframeButtonNode';
WireframeInputNode.displayName = 'WireframeInputNode';
WireframeImageNode.displayName = 'WireframeImageNode';
WireframeIconNode.displayName = 'WireframeIconNode';
