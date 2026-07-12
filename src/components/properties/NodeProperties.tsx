import React, { useRef, useState } from 'react';
import { Node } from '@/lib/reactflowCompat';
import { NodeData } from '@/lib/types';
import { Box, Palette, Star, Image as ImageStart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ShapeSelector } from './ShapeSelector';
import { ColorPicker } from './ColorPicker';
import { IconPicker, type ProviderIconSelection } from './IconPicker';
import { ImageUpload } from './ImageUpload';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { useMarkdownEditor } from '@/hooks/useMarkdownEditor';
import { NodeActionButtons } from './NodeActionButtons';
import { NodeContentSection } from './NodeContentSection';
import { InspectorSectionDivider } from './InspectorPrimitives';
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

interface NodePropertiesProps {
  selectedNode: Node<NodeData>;
  onChange: (id: string, data: Partial<NodeData>) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onFitSectionToContents?: (id: string) => void;
  onReleaseFromSection?: (id: string) => void;
  onBringContentsIntoSection?: (id: string) => void;
}

export const NodeProperties: React.FC<NodePropertiesProps> = ({
  selectedNode,
  onChange,
  onDuplicate,
  onDelete,
  onFitSectionToContents,
  onReleaseFromSection,
  onBringContentsIntoSection,
}) => {
  const { t } = useTranslation();
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

  function getDefaultSection(): string {
    if (isIconAssetNode) return 'icon';
    if (isSection) return 'content';
    if (isAnnotation) return 'content';
    return 'content';
  }

  const [activeSectionsByNode, setActiveSectionsByNode] = useState<Record<string, string>>({});
  const activeSection = activeSectionsByNode[selectedNode.id] ?? getDefaultSection();

  function toggleSection(section: string): void {
    const currentSection = activeSectionsByNode[selectedNode.id] ?? getDefaultSection();
    setActiveSectionsByNode((prev) => ({
      ...prev,
      [selectedNode.id]: currentSection === section ? '' : section,
    }));
  }

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

  return (
    <>
      <NodePropertiesHeader selectedNode={selectedNode} onChange={onChange} />
      <div className="space-y-5 px-4">
      <InspectorSectionDivider />

      {!isAnnotation &&
        !isSection &&
        !isIconAssetNode && (
          <CollapsibleSection
            title={t('properties.shape', 'Shape')}
            icon={<Box className="w-3.5 h-3.5" />}
            isOpen={activeSection === 'shape'}
            onToggle={() => toggleSection('shape')}
          >
            <ShapeSelector
              selectedShape={selectedNode.data?.shape}
              onChange={(shape) => onChange(selectedNode.id, { shape })}
            />
          </CollapsibleSection>
        )}

      <NodeContentSection
        selectedNode={selectedNode}
        onChange={onChange}
        isOpen={activeSection === 'content'}
        onToggle={() => toggleSection('content')}
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
      {!isIconAssetNode && (
        <CollapsibleSection
          title={t('properties.color', 'Color')}
          icon={<Palette className="w-3.5 h-3.5" />}
          isOpen={activeSection === 'color'}
          onToggle={() => toggleSection('color')}
        >
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
        </CollapsibleSection>
      )}

      {!isAnnotation && (
        <CollapsibleSection
          title={t('properties.icon', 'Icon')}
          icon={<Star className="w-3.5 h-3.5" />}
          isOpen={activeSection === 'icon'}
          onToggle={() => toggleSection('icon')}
        >
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
        </CollapsibleSection>
      )}

      {!isIconAssetNode && (
        <CollapsibleSection
          title="Custom Image"
          icon={<ImageStart className="w-3.5 h-3.5" />}
          isOpen={activeSection === 'upload'}
          onToggle={() => toggleSection('upload')}
        >
          <ImageUpload
            imageUrl={selectedNode.data?.imageUrl}
            onChange={(url) => onChange(selectedNode.id, { imageUrl: url })}
          />
        </CollapsibleSection>
      )}

      <NodeActionButtons
        nodeId={selectedNode.id}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        secondaryActions={sectionActions}
      />
      </div>
    </>
  );
};
