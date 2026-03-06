import React, { memo } from 'react';
import { Handle, Position } from '@/lib/reactflowCompat';
import type { LegacyNodeProps } from '@/lib/reactflowCompat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { NodeData } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { useInlineNodeTextEdit } from '@/hooks/useInlineNodeTextEdit';
import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import { getConnectorHandleStyle, getHandlePointerEvents, getV2HandleVisibilityClass } from './handleInteraction';
import { NodeTransformControls } from './NodeTransformControls';

function AnnotationNode({ id, data, selected }: LegacyNodeProps<NodeData>): React.ReactElement {
  const { t } = useTranslation();
  const visualQualityV2Enabled = ROLLOUT_FLAGS.visualQualityV2;
  const handlePointerEvents = getHandlePointerEvents(visualQualityV2Enabled, Boolean(selected));
  const handleVisibilityClass = visualQualityV2Enabled
    ? getV2HandleVisibilityClass(Boolean(selected), { includeConnectingState: false })
    : selected
      ? 'opacity-100'
      : 'opacity-0 group-hover:opacity-100 [.is-connecting_&]:opacity-100';
  const labelEdit = useInlineNodeTextEdit(id, 'label', data.label || '');
  const subLabelEdit = useInlineNodeTextEdit(id, 'subLabel', data.subLabel || '');
  return (
    <>
      <NodeTransformControls
        isVisible={Boolean(selected)}
        minWidth={150}
        minHeight={100}
      />
      <div
        className={`
          relative group flex flex-col h-full shadow-md flow-lod-shadow rounded-br-3xl rounded-tl-sm rounded-tr-sm rounded-bl-sm border border-yellow-300 transition-all duration-200
          bg-yellow-100/90
          ${selected ? `ring-2 ring-yellow-400 ring-offset-2 z-10` : 'hover:shadow-lg'}
        `}
        style={{ minWidth: 200, width: '100%', height: '100%' }}
      >
        <div className="p-4 flex flex-col h-full">
            {data.label && (
                <div
                    className="text-sm font-bold text-yellow-900 border-b border-yellow-200 pb-2 mb-2"
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
                            className="w-full rounded border border-yellow-400 bg-yellow-50 px-1 py-0.5 outline-none"
                        />
                    ) : (
                        data.label
                    )}
                </div>
            )}
            <div
                className="text-xs text-yellow-800 font-medium leading-relaxed markdown-content flex-1 overflow-hidden flow-lod-secondary"
                onClick={(event) => {
                    event.stopPropagation();
                    subLabelEdit.beginEdit();
                }}
            >
                {subLabelEdit.isEditing ? (
                    <input
                        autoFocus
                        value={subLabelEdit.draft}
                        onChange={(event) => subLabelEdit.setDraft(event.target.value)}
                        onBlur={subLabelEdit.commit}
                        onKeyDown={subLabelEdit.handleKeyDown}
                        onMouseDown={(event) => event.stopPropagation()}
                        className="w-full rounded border border-yellow-400 bg-yellow-50 px-1 py-0.5 outline-none"
                    />
                ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {data.subLabel || t('annotationNode.placeholder')}
                    </ReactMarkdown>
                )}
            </div>
        </div>

        {/* Decorative corner fold */}
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-200/50 rounded-tl-xl border-t border-l border-yellow-300/30"></div>
      </div>

      <Handle
        type="source"
        position={Position.Top}
        id="top"
        isConnectableStart
        isConnectableEnd
        className={`!w-3 !h-3 !border-2 !border-white !bg-yellow-500 transition-all duration-150 hover:scale-125 ${handleVisibilityClass}`}
        style={getConnectorHandleStyle('top', Boolean(selected), handlePointerEvents)}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectableStart
        isConnectableEnd
        className={`!w-3 !h-3 !border-2 !border-white !bg-yellow-500 transition-all duration-150 hover:scale-125 ${handleVisibilityClass}`}
        style={getConnectorHandleStyle('right', Boolean(selected), handlePointerEvents)}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectableStart
        isConnectableEnd
        className={`!w-3 !h-3 !border-2 !border-white !bg-yellow-500 transition-all duration-150 hover:scale-125 ${handleVisibilityClass}`}
        style={getConnectorHandleStyle('bottom', Boolean(selected), handlePointerEvents)}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        isConnectableStart
        isConnectableEnd
        className={`!w-3 !h-3 !border-2 !border-white !bg-yellow-500 transition-all duration-150 hover:scale-125 ${handleVisibilityClass}`}
        style={getConnectorHandleStyle('left', Boolean(selected), handlePointerEvents)}
      />
    </>
  );
}

export default memo(AnnotationNode);
