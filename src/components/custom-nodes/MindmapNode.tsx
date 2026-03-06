import React, { memo } from 'react';
import { Handle, Position } from '@/lib/reactflowCompat';
import type { LegacyNodeProps } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { useInlineNodeTextEdit } from '@/hooks/useInlineNodeTextEdit';
import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import { getConnectorHandleStyle, getHandlePointerEvents, getV2HandleVisibilityClass } from '@/components/handleInteraction';
import { NodeTransformControls } from '@/components/NodeTransformControls';

function MindmapNode({ id, data, selected }: LegacyNodeProps<NodeData>): React.ReactElement {
  const visualQualityV2Enabled = ROLLOUT_FLAGS.visualQualityV2;
  const handlePointerEvents = getHandlePointerEvents(visualQualityV2Enabled, Boolean(selected));
  const handleVisibilityClass = visualQualityV2Enabled
    ? getV2HandleVisibilityClass(Boolean(selected))
    : selected
      ? 'opacity-100'
      : 'opacity-0 group-hover:opacity-100 [.is-connecting_&]:opacity-100';
  const labelEdit = useInlineNodeTextEdit(id, 'label', data.label || '');
  const depth = typeof (data as NodeData & { mindmapDepth?: number }).mindmapDepth === 'number'
    ? (data as NodeData & { mindmapDepth?: number }).mindmapDepth!
    : 0;

  const isRoot = depth === 0;
  const surfaceClass = isRoot
    ? 'bg-slate-900 text-white border-slate-900'
    : 'bg-white text-slate-800 border-slate-200';

  return (
    <>
      <NodeTransformControls
        isVisible={Boolean(selected)}
        minWidth={120}
        minHeight={44}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        isConnectableStart
        isConnectableEnd
        className={`!w-3 !h-3 !bg-slate-400 !border-2 !border-white transition-all duration-150 hover:scale-125 ${handleVisibilityClass}`}
        style={getConnectorHandleStyle('top', Boolean(selected), handlePointerEvents)}
      />

      <Handle
        type="source"
        position={Position.Left}
        id="left-target"
        isConnectableStart
        isConnectableEnd
        className={`!w-3 !h-3 !bg-slate-400 !border-2 !border-white transition-all duration-150 hover:scale-125 ${handleVisibilityClass}`}
        style={getConnectorHandleStyle('left', Boolean(selected), handlePointerEvents)}
      />

      <div
        className={`min-w-[120px] max-w-[260px] rounded-xl border px-3 py-2 shadow-sm transition-all ${surfaceClass} ${
          selected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
        }`}
      >
        <div
          className={`text-sm leading-snug break-words ${isRoot ? 'font-semibold' : 'font-medium'}`}
          onClick={(event) => {
            event.stopPropagation();
            labelEdit.beginEdit();
          }}
        >
          {labelEdit.isEditing ? (
            <input
              autoFocus
              value={labelEdit.draft}
              onChange={(event) => labelEdit.setDraft(event.target.value)}
              onBlur={labelEdit.commit}
              onKeyDown={labelEdit.handleKeyDown}
              onMouseDown={(event) => event.stopPropagation()}
              className="w-full rounded border border-[var(--brand-primary)] bg-white px-1 py-0.5 text-slate-900 outline-none"
            />
          ) : (
            data.label || 'Topic'
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectableStart
        isConnectableEnd
        className={`!w-3 !h-3 !bg-slate-400 !border-2 !border-white transition-all duration-150 hover:scale-125 ${handleVisibilityClass}`}
        style={getConnectorHandleStyle('right', Boolean(selected), handlePointerEvents)}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectableStart
        isConnectableEnd
        className={`!w-3 !h-3 !bg-slate-400 !border-2 !border-white transition-all duration-150 hover:scale-125 ${handleVisibilityClass}`}
        style={getConnectorHandleStyle('bottom', Boolean(selected), handlePointerEvents)}
      />
    </>
  );
}

export default memo(MindmapNode);
