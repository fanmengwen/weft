import React, { Suspense, lazy, memo } from 'react';
import { Pencil } from 'lucide-react';
import type { LegacyNodeProps } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { useInlineNodeTextEdit } from '@/hooks/useInlineNodeTextEdit';
import { InlineTextEditSurface } from './InlineTextEditSurface';
import { NodeChrome } from './NodeChrome';
import { hasMarkdownSyntax } from './markdownSyntax';
import { useFlowStore } from '@/store';
import {
  ANNOTATION_COLOR_OPTIONS,
  normalizeAnnotationColorKey,
  resolveAnnotationStickyTheme,
} from './annotationTheme';

const LazyMarkdownRenderer = lazy(async () => {
  const module = await import('./MarkdownRenderer');
  return { default: module.MarkdownRenderer };
});

function AnnotationNode({ id, data, selected }: LegacyNodeProps<NodeData>): React.ReactElement {
  const { t } = useTranslation();
  const setNodes = useFlowStore((state) => state.setNodes);
  const labelEdit = useInlineNodeTextEdit(id, 'label', data.label || '');
  const subLabelEdit = useInlineNodeTextEdit(id, 'subLabel', data.subLabel || '', {
    multiline: true,
    allowTabCreateSibling: false,
  });
  const stickyTheme = resolveAnnotationStickyTheme(data.color);
  const selectedStickyColor = normalizeAnnotationColorKey(data.color);
  const lineCount = (data.subLabel || '').split('\n').length;
  const contentMinHeight = Math.max(100, 84 + lineCount * 18);
  const subLabelContent = data.subLabel || t('annotationNode.placeholder');
  const renderedSubLabel = hasMarkdownSyntax(subLabelContent) ? (
    <Suspense fallback={<span className="whitespace-pre-wrap break-words">{subLabelContent}</span>}>
      <LazyMarkdownRenderer content={subLabelContent} />
    </Suspense>
  ) : (
    <span className="whitespace-pre-wrap break-words">{subLabelContent}</span>
  );
  return (
    <NodeChrome
      nodeId={id}
      selected={Boolean(selected)}
      minWidth={150}
      minHeight={100}
      handleClassName=""
      handleVisibilityOptions={{ includeConnectingState: false }}
    >
      <div
        data-annotation-surface="1"
        className={`
          relative group flex flex-col border transition-all duration-200
          ${selected ? 'z-10' : ''}
        `}
        style={{
          minWidth: 200,
          width: '100%',
          minHeight: contentMinHeight,
          background: stickyTheme.background,
          borderColor: stickyTheme.borderColor,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '10px',
        }}
      >
        {selected ? (
          <div className="absolute -top-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[var(--color-brand-border)] bg-[var(--brand-surface)] px-2 py-1 shadow-sm">
            {ANNOTATION_COLOR_OPTIONS.map((option) => {
              const optionTheme = resolveAnnotationStickyTheme(option.id);
              const optionColor = normalizeAnnotationColorKey(option.id);
              return (
              <button
                key={option.id}
                type="button"
                aria-label={`Set annotation color ${option.label}`}
                className={`h-3.5 w-3.5 rounded-full border transition-transform hover:scale-110 ${selectedStickyColor === optionColor ? 'ring-2 ring-[var(--brand-secondary)]/70' : ''}`}
                style={{
                  backgroundColor: optionTheme.dot,
                  borderColor: selectedStickyColor === optionColor ? optionTheme.borderColor : 'var(--brand-surface)',
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  setNodes((nodes) =>
                    nodes.map((node) =>
                      node.id === id ? { ...node, data: { ...node.data, color: option.id } } : node
                    )
                  );
                }}
              />
              );
            })}
          </div>
        ) : null}
        <div className="flex flex-col p-4">
          <div className="mb-2 flex items-center gap-2">
            <Pencil
              data-annotation-icon="1"
              className="h-4 w-4 shrink-0"
              style={{ color: stickyTheme.iconColor }}
              aria-hidden="true"
            />
            {data.label ? (
              <InlineTextEditSurface
                isEditing={labelEdit.isEditing}
                draft={labelEdit.draft}
                displayValue={data.label}
                onBeginEdit={labelEdit.beginEdit}
                onDraftChange={labelEdit.setDraft}
                onCommit={labelEdit.commit}
                onKeyDown={labelEdit.handleKeyDown}
                className="min-w-0 flex-1 text-sm font-bold"
                style={{ color: stickyTheme.bodyText }}
                isSelected={Boolean(selected)}
              />
            ) : null}
          </div>
          <div data-annotation-body="1">
            <InlineTextEditSurface
              isEditing={subLabelEdit.isEditing}
              draft={subLabelEdit.draft}
              displayValue={renderedSubLabel}
              onBeginEdit={subLabelEdit.beginEdit}
              onDraftChange={subLabelEdit.setDraft}
              onCommit={subLabelEdit.commit}
              onKeyDown={subLabelEdit.handleKeyDown}
              className="font-medium leading-relaxed markdown-content flow-lod-secondary"
              style={{ color: stickyTheme.bodyText, fontSize: '12px' }}
              inputMode="multiline"
              isSelected={Boolean(selected)}
            />
          </div>
        </div>
      </div>
    </NodeChrome>
  );
}

export default memo(AnnotationNode);

