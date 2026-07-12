import React, { useId, useRef, useState } from 'react';
import { Node } from '@/lib/reactflowCompat';
import { NodeData } from '@/lib/types';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { ShapeSelector } from './ShapeSelector';
import { ColorPicker } from './ColorPicker';
import { IconPicker, type ProviderIconSelection } from './IconPicker';
import { ImageUpload } from './ImageUpload';
import { useMarkdownEditor } from '@/hooks/useMarkdownEditor';
import { NodeContentSection } from './NodeContentSection';
import type { DomainLibraryCategory } from '@/services/domainLibrary';
import { getAssetCategoryDisplayName } from '@/services/assetPresentation';
import {
  createBuiltInIconData,
  createProviderIconData,
  createUploadedIconData,
  normalizeNodeIconData,
} from '@/lib/nodeIconState';
import { getNodeParentId } from '@/lib/nodeParent';
import { buildSectionActions } from './sectionActionBuilder';
import { NodePropertiesHeader } from './NodePropertiesHeader';
import { Button } from '../ui/Button';
import {
  chartNodeToneVars,
  getNodeDefaults,
  resolveChartNodeTone,
  type NodeShape,
} from '../nodeHelpers';

type NodePropertiesSection = 'content' | 'appearance';

interface NodePropertiesProps {
  selectedNode: Node<NodeData>;
  onChange: (id: string, data: Partial<NodeData>) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onFitSectionToContents?: (id: string) => void;
  onReleaseFromSection?: (id: string) => void;
  onBringContentsIntoSection?: (id: string) => void;
}

function PropertiesGroupDivider(): React.ReactElement {
  return <div className="h-px bg-[#F0F2F5]" />;
}

interface PropertiesAccordionHeaderProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  contentId: string;
  trailing?: React.ReactNode;
}

function PropertiesAccordionHeader({
  label,
  isOpen,
  onToggle,
  contentId,
  trailing,
}: PropertiesAccordionHeaderProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={contentId}
      className="flex w-full items-center justify-between py-3 text-left"
    >
      <span className="text-[11px] tracking-[0.05em] text-[#98A1AE]">{label}</span>
      <span className="flex items-center gap-2">
        {trailing}
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5 text-[#8B93A0]" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-[#8B93A0]" />
        )}
      </span>
    </button>
  );
}

export const NodeProperties: React.FC<NodePropertiesProps> = ({
  selectedNode,
  onChange,
  onDuplicate: _onDuplicate,
  onDelete,
  onFitSectionToContents,
  onReleaseFromSection,
  onBringContentsIntoSection,
}) => {
  const isAnnotation = selectedNode.type === 'annotation';
  const isSection = selectedNode.type === 'section';
  const isGroup = selectedNode.type === 'group';
  const normalizedIconData = normalizeNodeIconData(selectedNode.data);
  const isIconAssetNode = normalizedIconData?.assetPresentation === 'icon';
  const assetProvider = normalizedIconData?.assetProvider as DomainLibraryCategory | undefined;
  const assetCategory =
    typeof normalizedIconData?.assetCategory === 'string'
      ? normalizedIconData.assetCategory
      : undefined;
  const supportsAdvancedColorTheme = ['process', 'start', 'end', 'decision', 'custom'].includes(
    selectedNode.type || ''
  );
  const supportsColorMode =
    supportsAdvancedColorTheme || isSection || isGroup;
  const supportsCustomColor = supportsAdvancedColorTheme || isSection || isGroup || isAnnotation;
  const parentSectionId = getNodeParentId(selectedNode);
  const sectionActions = buildSectionActions({
    isSection,
    parentSectionId,
    nodeId: selectedNode.id,
    sectionHidden: selectedNode.data?.sectionHidden,
    sectionLocked: selectedNode.data?.sectionLocked,
    onFitSectionToContents,
    onBringContentsIntoSection,
    onReleaseFromSection,
    onChange,
  });

  const nodeType = selectedNode.type || 'process';
  const defaults = getNodeDefaults(nodeType);
  const shape = (selectedNode.data?.shape || defaults.shape) as NodeShape;
  const toneVars = chartNodeToneVars(resolveChartNodeTone(nodeType, shape));

  const [activeSectionsByNode, setActiveSectionsByNode] = useState<
    Record<string, NodePropertiesSection | ''>
  >({});
  const activeSection: NodePropertiesSection | '' =
    activeSectionsByNode[selectedNode.id] ?? 'content';

  function toggleSection(section: NodePropertiesSection): void {
    const currentSection = activeSectionsByNode[selectedNode.id] ?? 'content';
    setActiveSectionsByNode((prev) => ({
      ...prev,
      [selectedNode.id]: currentSection === section ? '' : section,
    }));
  }

  const contentGroupId = useId();
  const appearanceGroupId = useId();

  const labelInputRef = useRef<HTMLTextAreaElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);
  const [activeField, setActiveField] = useState<'label' | 'subLabel' | null>(null);

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
    } else {
      if (action === 'bold') {
        onChange(selectedNode.id, {
          fontWeight: selectedNode.data?.fontWeight === 'bold' ? 'normal' : 'bold',
        });
      } else {
        onChange(selectedNode.id, {
          fontStyle: selectedNode.data?.fontStyle === 'italic' ? 'normal' : 'italic',
        });
      }
    }
  }

  function handleBuiltInIconChange(icon: string): void {
    onChange(selectedNode.id, createBuiltInIconData(icon));
  }

  function handleProviderIconChange(selection: ProviderIconSelection): void {
    onChange(
      selectedNode.id,
      createProviderIconData({
        packId: selection.packId,
        shapeId: selection.shapeId,
        provider: selection.provider,
        category: selection.category,
      })
    );
  }

  function handleCustomIconChange(url?: string): void {
    onChange(selectedNode.id, createUploadedIconData(url));
  }

  const isContentOpen = activeSection === 'content';
  const isAppearanceOpen = activeSection === 'appearance';

  return (
    <>
      <NodePropertiesHeader
        key={selectedNode.id}
        selectedNode={selectedNode}
        onChange={onChange}
      />
      <PropertiesGroupDivider />

      <div className="px-4">
        <PropertiesAccordionHeader
          label="内容"
          isOpen={isContentOpen}
          onToggle={() => toggleSection('content')}
          contentId={contentGroupId}
        />
        {isContentOpen ? (
          <div id={contentGroupId} role="region">
            <NodeContentSection
              selectedNode={selectedNode}
              onChange={onChange}
              embedded
              onBold={() => handleStyleAction('bold')}
              onItalic={() => handleStyleAction('italic')}
              labelInputRef={labelInputRef}
              descInputRef={descInputRef}
              onLabelFocus={() => setActiveField('label')}
              onLabelBlur={() => setTimeout(() => setActiveField(null), 200)}
              onDescFocus={() => setActiveField('subLabel')}
              onDescBlur={() => setTimeout(() => setActiveField(null), 200)}
              onLabelKeyDown={labelEditor.handleKeyDown}
              onDescKeyDown={descEditor.handleKeyDown}
            />
          </div>
        ) : null}
      </div>

      <PropertiesGroupDivider />

      <div className="px-4">
        <PropertiesAccordionHeader
          label="外观"
          isOpen={isAppearanceOpen}
          onToggle={() => toggleSection('appearance')}
          contentId={appearanceGroupId}
          trailing={
            !isAppearanceOpen ? (
              <span
                className="h-3.5 w-3.5 rounded-full border-2 border-white ring-1 ring-[#E1E4EA]"
                style={{ background: toneVars.color }}
              />
            ) : null
          }
        />
        {isAppearanceOpen ? (
          <div id={appearanceGroupId} role="region" className="space-y-5 pb-4">
            {!isAnnotation && !isSection && !isIconAssetNode ? (
              <ShapeSelector
                selectedShape={selectedNode.data?.shape}
                onChange={(nextShape) => onChange(selectedNode.id, { shape: nextShape })}
              />
            ) : null}

            {!isIconAssetNode ? (
              <ColorPicker
                selectedColor={selectedNode.data?.color}
                selectedColorMode={selectedNode.data?.colorMode}
                selectedCustomColor={selectedNode.data?.customColor}
                onChange={(color) =>
                  onChange(selectedNode.id, {
                    color,
                    ...(color === 'custom' ? {} : { customColor: undefined }),
                  })
                }
                onColorModeChange={
                  supportsColorMode
                    ? (colorMode) => onChange(selectedNode.id, { colorMode })
                    : undefined
                }
                onCustomColorChange={
                  supportsCustomColor
                    ? (customColor) => onChange(selectedNode.id, { color: 'custom', customColor })
                    : undefined
                }
                allowModes={supportsColorMode}
                allowCustom={supportsCustomColor}
              />
            ) : null}

            {!isAnnotation ? (
              <div className="space-y-3">
                <IconPicker
                  selectedIcon={normalizedIconData?.icon}
                  customIconUrl={normalizedIconData?.customIconUrl}
                  selectedProvider={assetProvider}
                  selectedProviderCategory={assetCategory}
                  selectedProviderPackId={normalizedIconData?.archIconPackId as string | undefined}
                  selectedProviderShapeId={normalizedIconData?.archIconShapeId as string | undefined}
                  onSelectBuiltInIcon={handleBuiltInIconChange}
                  onSelectProviderIcon={handleProviderIconChange}
                  onCustomIconChange={handleCustomIconChange}
                />
                {isIconAssetNode && (assetProvider || assetCategory) ? (
                  <div className="rounded-[var(--brand-radius)] border border-[var(--color-brand-border)] bg-[var(--brand-surface)] px-3 py-2">
                    <div className="text-[11px] font-medium text-[var(--brand-secondary)]">
                      {assetProvider ? getAssetCategoryDisplayName(assetProvider) : 'Icons'}
                      {assetCategory ? ` • ${assetCategory}` : ''}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {!isIconAssetNode ? (
              <ImageUpload
                imageUrl={selectedNode.data?.imageUrl}
                onChange={(url) => onChange(selectedNode.id, { imageUrl: url })}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <PropertiesGroupDivider />

      {sectionActions.length > 0 ? (
        <div className="flex flex-wrap gap-2 px-3 py-2">
          {sectionActions.map((action) => (
            <Button
              key={action.id}
              onClick={action.onClick}
              variant="ghost"
              className="flex-1"
              icon={action.icon}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="flex items-center px-3 py-2">
        <button
          type="button"
          onClick={() => onDelete(selectedNode.id)}
          className="inline-flex items-center gap-1.5 rounded-[7px] px-2 py-1.5 text-[12.5px] font-medium text-[#C4443C] hover:bg-[#FBEFEE]"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </>
  );
};
