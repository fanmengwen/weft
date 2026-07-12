import React from 'react';
import { Node } from '@/lib/reactflowCompat';
import { NodeData } from '@/lib/types';
import { handlePropertyInputKeyDown } from './propertyInputBehavior';
import {
  ANNOTATION_COLOR_OPTIONS,
  bucketAnnotationFontSize,
  normalizeAnnotationColorKey,
  resolveAnnotationStickyTheme,
} from '../annotationTheme';

interface NodeContentSectionProps {
  selectedNode: Node<NodeData>;
  onChange: (id: string, data: Partial<NodeData>) => void;
  embedded?: boolean;
}

type ContentProfile = 'start-end' | 'process' | 'decision' | 'io' | 'database' | 'annotation' | 'fallback';

const FIELD_LABEL_CLASS = 'text-[12px] font-medium text-[#5C6572]';
const INPUT_CLASS =
  'h-[34px] w-full rounded-[8px] border border-[#D8DCE2] bg-white px-[10px] text-[13px] text-[#171D26] focus:border-[var(--wf-acc)] focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--wf-acc)_10%,transparent)]';
const TEXTAREA_CLASS =
  'w-full min-h-[64px] resize-none rounded-[8px] border border-[#D8DCE2] bg-white px-[10px] py-[8px] text-[13px] leading-[1.5] text-[#171D26] focus:border-[var(--wf-acc)] focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--wf-acc)_10%,transparent)]';

const ANNOTATION_FONT_SIZE_OPTIONS = [
  { bucket: 'small' as const, label: '小', value: '12' },
  { bucket: 'medium' as const, label: '中', value: '14' },
  { bucket: 'large' as const, label: '大', value: '18' },
];

const ANNOTATION_COLOR_ARIA_LABELS: Record<(typeof ANNOTATION_COLOR_OPTIONS)[number]['id'], string> = {
  yellow: '黄',
  emerald: '绿',
  blue: '蓝',
};

function autoResizeTextarea(target: HTMLTextAreaElement): void {
  target.style.height = 'auto';
  target.style.height = `${target.scrollHeight}px`;
}

function resolveContentProfile(node: Node<NodeData>): ContentProfile {
  const nodeType = node.type || 'process';
  if (nodeType === 'annotation') return 'annotation';
  if (nodeType === 'start' || nodeType === 'end') return 'start-end';
  if (nodeType === 'process') return 'process';
  if (nodeType === 'decision') return 'decision';
  if (nodeType === 'custom' && node.data?.shape === 'parallelogram') return 'io';
  if (nodeType === 'custom' && node.data?.shape === 'cylinder') return 'database';
  return 'fallback';
}

interface FieldLabelProps {
  children: React.ReactNode;
  isFirst?: boolean;
}

function FieldLabel({ children, isFirst = false }: FieldLabelProps): React.ReactElement {
  return (
    <div className={`${FIELD_LABEL_CLASS} ${isFirst ? 'mt-[10px] mb-[6px]' : 'mt-[12px] mb-[6px]'}`}>
      {children}
    </div>
  );
}

interface DisplayNameFieldProps {
  selectedNode: Node<NodeData>;
  onChange: NodeContentSectionProps['onChange'];
  isFirst?: boolean;
}

function DisplayNameField({
  selectedNode,
  onChange,
  isFirst = true,
}: DisplayNameFieldProps): React.ReactElement {
  return (
    <>
      <FieldLabel isFirst={isFirst}>显示名称</FieldLabel>
      <input
        type="text"
        value={selectedNode.data?.label || ''}
        onChange={(event) => onChange(selectedNode.id, { label: event.target.value })}
        onKeyDown={(event) => handlePropertyInputKeyDown(event, { blurOnModifiedEnter: true })}
        className={INPUT_CLASS}
      />
    </>
  );
}

interface SubLabelFieldProps {
  selectedNode: Node<NodeData>;
  onChange: NodeContentSectionProps['onChange'];
  label: string;
}

function SubLabelField({ selectedNode, onChange, label }: SubLabelFieldProps): React.ReactElement {
  return (
    <>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={selectedNode.data?.subLabel || ''}
        onChange={(event) => {
          onChange(selectedNode.id, { subLabel: event.target.value });
          autoResizeTextarea(event.target);
        }}
        onKeyDown={(event) => handlePropertyInputKeyDown(event, { blurOnModifiedEnter: true })}
        rows={3}
        className={TEXTAREA_CLASS}
      />
    </>
  );
}

interface DirectionFieldProps {
  selectedNode: Node<NodeData>;
  onChange: NodeContentSectionProps['onChange'];
}

function DirectionField({ selectedNode, onChange }: DirectionFieldProps): React.ReactElement {
  const activeDirection = selectedNode.data?.ioDirection ?? 'input';

  return (
    <>
      <FieldLabel>方向</FieldLabel>
      <div className="inline-flex rounded-[9px] bg-[#F0F2F5] p-[2px]">
        <button
          type="button"
          onClick={() => onChange(selectedNode.id, { ioDirection: 'input' })}
          className={`rounded-[7px] px-3 py-1 text-[12.5px] ${
            activeDirection === 'input'
              ? 'bg-white font-semibold text-[#171D26] shadow-sm'
              : 'text-[#5C6572]'
          }`}
        >
          输入
        </button>
        <button
          type="button"
          onClick={() => onChange(selectedNode.id, { ioDirection: 'output' })}
          className={`rounded-[7px] px-3 py-1 text-[12.5px] ${
            activeDirection === 'output'
              ? 'bg-white font-semibold text-[#171D26] shadow-sm'
              : 'text-[#5C6572]'
          }`}
        >
          输出
        </button>
      </div>
    </>
  );
}

function AnnotationContentFields({
  selectedNode,
  onChange,
}: Pick<NodeContentSectionProps, 'selectedNode' | 'onChange'>): React.ReactElement {
  const activeFontBucket = bucketAnnotationFontSize(selectedNode.data?.fontSize);
  const selectedColor = normalizeAnnotationColorKey(selectedNode.data?.color);

  return (
    <>
      <FieldLabel isFirst>文本内容</FieldLabel>
      <textarea
        value={selectedNode.data?.subLabel || ''}
        onChange={(event) => {
          onChange(selectedNode.id, { subLabel: event.target.value });
          autoResizeTextarea(event.target);
        }}
        onKeyDown={(event) => handlePropertyInputKeyDown(event, { blurOnModifiedEnter: true })}
        rows={3}
        className={TEXTAREA_CLASS}
      />
      <FieldLabel>字号</FieldLabel>
      <div className="inline-flex rounded-[9px] bg-[#F0F2F5] p-[2px]">
        {ANNOTATION_FONT_SIZE_OPTIONS.map((option) => (
          <button
            key={option.bucket}
            type="button"
            onClick={() => onChange(selectedNode.id, { fontSize: option.value })}
            className={`rounded-[7px] px-3 py-1 text-[12.5px] ${
              activeFontBucket === option.bucket
                ? 'bg-white font-semibold text-[#171D26] shadow-sm'
                : 'text-[#5C6572]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <FieldLabel>便签色</FieldLabel>
      <div className="flex items-center gap-2">
        {ANNOTATION_COLOR_OPTIONS.map((option) => {
          const isSelected = selectedColor === normalizeAnnotationColorKey(option.id);
          return (
            <button
              key={option.id}
              type="button"
              aria-label={ANNOTATION_COLOR_ARIA_LABELS[option.id]}
              aria-pressed={isSelected}
              onClick={() => onChange(selectedNode.id, { color: option.id })}
              className={`h-6 w-6 rounded-full border-2 border-white ring-1 ring-[#E1E4EA] ${
                isSelected ? 'ring-2 ring-[var(--wf-acc)]' : ''
              }`}
              style={{ background: resolveAnnotationStickyTheme(option.id).dot }}
            />
          );
        })}
      </div>
    </>
  );
}

function PerTypeContentFields({
  selectedNode,
  onChange,
  profile,
}: {
  selectedNode: Node<NodeData>;
  onChange: NodeContentSectionProps['onChange'];
  profile: ContentProfile;
}): React.ReactElement {
  switch (profile) {
    case 'start-end':
      return <DisplayNameField selectedNode={selectedNode} onChange={onChange} />;
    case 'process':
      return (
        <>
          <DisplayNameField selectedNode={selectedNode} onChange={onChange} />
          <SubLabelField selectedNode={selectedNode} onChange={onChange} label="说明" />
        </>
      );
    case 'decision':
      return (
        <>
          <DisplayNameField selectedNode={selectedNode} onChange={onChange} />
          <SubLabelField selectedNode={selectedNode} onChange={onChange} label="条件文本" />
        </>
      );
    case 'io':
      return (
        <>
          <DisplayNameField selectedNode={selectedNode} onChange={onChange} />
          <DirectionField selectedNode={selectedNode} onChange={onChange} />
        </>
      );
    case 'database':
      return (
        <>
          <DisplayNameField selectedNode={selectedNode} onChange={onChange} />
          <SubLabelField selectedNode={selectedNode} onChange={onChange} label="说明（存储内容）" />
        </>
      );
    case 'annotation':
      return <AnnotationContentFields selectedNode={selectedNode} onChange={onChange} />;
    default:
      return <DisplayNameField selectedNode={selectedNode} onChange={onChange} />;
  }
}

export function NodeContentSection({
  selectedNode,
  onChange,
  embedded = false,
}: NodeContentSectionProps): React.ReactElement {
  const profile = resolveContentProfile(selectedNode);
  const wrapperClass = embedded ? 'pb-4' : 'px-1 pb-4';

  return (
    <div className={wrapperClass}>
      <PerTypeContentFields selectedNode={selectedNode} onChange={onChange} profile={profile} />
    </div>
  );
}
