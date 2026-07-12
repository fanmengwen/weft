import React, { useRef, useState } from 'react';
import { Node } from '@/lib/reactflowCompat';
import { NodeData } from '@/lib/types';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Select, type SelectOption } from '../ui/Select';
import { useMarkdownEditor } from '@/hooks/useMarkdownEditor';
import { handlePropertyInputKeyDown } from './propertyInputBehavior';

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

const FONT_FAMILY_OPTIONS: SelectOption[] = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'outfit', label: 'Outfit' },
  { value: 'playfair', label: 'Playfair' },
  { value: 'fira', label: 'Mono' },
];

const LABEL_SIZE_OPTIONS: SelectOption[] = ['12', '14', '16', '18', '20', '24', '32', '48', '64'].map((size) => ({
  value: size,
  label: `${size}px`,
}));

const DESCRIPTION_SIZE_OPTIONS: SelectOption[] = ['10', '12', '14', '16', '18', '20', '24'].map((size) => ({
  value: size,
  label: `${size}px`,
}));

const LEGACY_SEGMENT_BUTTON_BASE_CLASS =
  'flex items-center justify-center h-7 w-8 rounded-[4px] transition-all duration-150';
const LEGACY_SEGMENT_BUTTON_ACTIVE_CLASS =
  'bg-[var(--brand-background)] text-[var(--brand-text)] shadow-sm ring-1 ring-black/5 dark:ring-white/10';
const LEGACY_SEGMENT_BUTTON_INACTIVE_CLASS =
  'text-[var(--brand-secondary)] hover:bg-[var(--brand-background)]/50 hover:text-[var(--brand-text)]';
const LEGACY_SEGMENT_GROUP_CLASS =
  'flex items-center rounded-[var(--radius-sm)] border border-[var(--color-brand-border)] bg-[var(--brand-surface)] p-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]';

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

function getLegacySegmentButtonClassName(active: boolean): string {
  return `${LEGACY_SEGMENT_BUTTON_BASE_CLASS} ${active ? LEGACY_SEGMENT_BUTTON_ACTIVE_CLASS : LEGACY_SEGMENT_BUTTON_INACTIVE_CLASS}`;
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
  multiline?: boolean;
  isFirst?: boolean;
}

function DisplayNameField({
  selectedNode,
  onChange,
  multiline = false,
  isFirst = true,
}: DisplayNameFieldProps): React.ReactElement {
  if (multiline) {
    return (
      <>
        <FieldLabel isFirst={isFirst}>显示名称</FieldLabel>
        <textarea
          value={selectedNode.data?.label || ''}
          onChange={(event) => {
            onChange(selectedNode.id, { label: event.target.value });
            autoResizeTextarea(event.target);
          }}
          onKeyDown={(event) => handlePropertyInputKeyDown(event, { blurOnModifiedEnter: true })}
          rows={1}
          className={TEXTAREA_CLASS}
        />
      </>
    );
  }

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

function AnnotationLegacyContent({
  selectedNode,
  onChange,
}: Pick<NodeContentSectionProps, 'selectedNode' | 'onChange'>): React.ReactElement {
  const labelInputRef = useRef<HTMLTextAreaElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);
  const [activeField, setActiveField] = useState<'label' | 'subLabel' | null>(null);
  const hasSubLabel = Boolean(selectedNode.data?.subLabel && selectedNode.data.subLabel.trim().length > 0);

  const labelEditor = useMarkdownEditor(
    labelInputRef,
    (val) => onChange(selectedNode.id, { label: val }),
    selectedNode.data?.label || ''
  );
  const descEditor = useMarkdownEditor(
    descInputRef,
    (val) => onChange(selectedNode.id, { subLabel: val }),
    selectedNode.data?.subLabel || ''
  );

  function handleStyleAction(action: 'bold' | 'italic'): void {
    if (activeField === 'label') {
      if (action === 'bold') labelEditor.insert('**', '**');
      else labelEditor.insert('_', '_');
    } else if (activeField === 'subLabel') {
      if (action === 'bold') descEditor.insert('**', '**');
      else descEditor.insert('_', '_');
    } else if (action === 'bold') {
      onChange(selectedNode.id, {
        fontWeight: selectedNode.data?.fontWeight === 'bold' ? 'normal' : 'bold',
      });
    } else {
      onChange(selectedNode.id, {
        fontStyle: selectedNode.data?.fontStyle === 'italic' ? 'normal' : 'italic',
      });
    }
  }

  function handleContentKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    delegate: (nextEvent: React.KeyboardEvent) => void
  ): void {
    handlePropertyInputKeyDown(event, { blurOnModifiedEnter: true });
    delegate(event);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-brand-border)] bg-[var(--brand-surface)] shadow-sm transition-all focus-within:border-[var(--brand-primary)]/40 focus-within:ring-4 focus-within:ring-[var(--brand-primary)]/10 text-[var(--brand-text)]">
      <textarea
        ref={labelInputRef}
        value={selectedNode.data?.label || ''}
        onFocus={() => setActiveField('label')}
        onBlur={() => setTimeout(() => setActiveField(null), 200)}
        onChange={(event) => {
          onChange(selectedNode.id, { label: event.target.value });
          autoResizeTextarea(event.target);
        }}
        onKeyDown={(event) => handleContentKeyDown(event, labelEditor.handleKeyDown)}
        placeholder="Enter primary text..."
        rows={1}
        style={{ minHeight: '56px' }}
        className="w-full resize-none border-0 bg-transparent px-3.5 py-3.5 text-[14px] font-semibold leading-relaxed outline-none placeholder:text-[var(--brand-secondary)]/50 focus:ring-0"
      />
      <div className="relative border-t border-[var(--color-brand-border)]/60 bg-[var(--brand-background)]/30 transition-colors focus-within:bg-[var(--brand-surface)]">
        <textarea
          ref={descInputRef}
          value={selectedNode.data?.subLabel || ''}
          onFocus={() => setActiveField('subLabel')}
          onBlur={() => setTimeout(() => setActiveField(null), 200)}
          onChange={(event) => {
            onChange(selectedNode.id, { subLabel: event.target.value });
            autoResizeTextarea(event.target);
          }}
          onKeyDown={(event) => handleContentKeyDown(event, descEditor.handleKeyDown)}
          placeholder="Add descriptive text (Markdown supported)..."
          rows={1}
          style={{ minHeight: '48px' }}
          className="w-full resize-none border-0 bg-transparent px-3.5 py-3 text-[12px] font-medium leading-relaxed text-[var(--brand-secondary)] outline-none placeholder:text-[var(--brand-secondary)]/50 focus:text-[var(--brand-text)] focus:ring-0"
        />
      </div>
      <div className="flex flex-col gap-2.5 border-t border-[var(--color-brand-border)] bg-[var(--brand-background)]/40 p-2.5">
        <div className="w-full">
          <Select
            value={selectedNode.data?.fontFamily || 'inter'}
            onChange={(val) => onChange(selectedNode.id, { fontFamily: val })}
            options={FONT_FAMILY_OPTIONS}
            placeholder="Font family"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-[85px] shrink-0">
            <Select
              value={selectedNode.data?.fontSize || '14'}
              onChange={(val) => onChange(selectedNode.id, { fontSize: val })}
              options={LABEL_SIZE_OPTIONS}
              placeholder="Size"
            />
          </div>
          <div className="flex flex-1 items-center justify-end gap-1.5">
            <div className={LEGACY_SEGMENT_GROUP_CLASS}>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleStyleAction('bold');
                }}
                className={getLegacySegmentButtonClassName(selectedNode.data?.fontWeight === 'bold')}
                title="Bold (Cmd+B)"
              >
                <Bold className="h-3.5 w-3.5" strokeWidth={selectedNode.data?.fontWeight === 'bold' ? 2.5 : 2} />
              </button>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleStyleAction('italic');
                }}
                className={getLegacySegmentButtonClassName(selectedNode.data?.fontStyle === 'italic')}
                title="Italic (Cmd+I)"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className={LEGACY_SEGMENT_GROUP_CLASS}>
              <button
                type="button"
                onClick={() => onChange(selectedNode.id, { align: 'left' })}
                className={getLegacySegmentButtonClassName(selectedNode.data?.align === 'left')}
                title="Align Left"
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange(selectedNode.id, { align: 'center' })}
                className={getLegacySegmentButtonClassName(!selectedNode.data?.align || selectedNode.data?.align === 'center')}
                title="Align Center"
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange(selectedNode.id, { align: 'right' })}
                className={getLegacySegmentButtonClassName(selectedNode.data?.align === 'right')}
                title="Align Right"
              >
                <AlignRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {hasSubLabel ? (
        <div className="flex flex-col gap-2.5 border-t border-dashed border-[var(--color-brand-border)] bg-[var(--brand-background)]/20 p-2.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-secondary)]">
              Secondary Style
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Select
                value={selectedNode.data?.subLabelFontFamily || selectedNode.data?.fontFamily || 'inter'}
                onChange={(val) => onChange(selectedNode.id, { subLabelFontFamily: val })}
                options={FONT_FAMILY_OPTIONS}
                placeholder="Secondary Font"
              />
            </div>
            <div className="w-[85px] shrink-0">
              <Select
                value={selectedNode.data?.subLabelFontSize || '12'}
                onChange={(val) => onChange(selectedNode.id, { subLabelFontSize: val })}
                options={DESCRIPTION_SIZE_OPTIONS}
                placeholder="Size"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
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
      return <AnnotationLegacyContent selectedNode={selectedNode} onChange={onChange} />;
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
