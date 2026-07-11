import React, { memo } from 'react';
import type { LegacyNodeProps } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';

import MemoizedMarkdown from './MemoizedMarkdown';
import { resolveNodeVisualStyle } from '../theme';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useInlineNodeTextEdit } from '@/hooks/useInlineNodeTextEdit';
import { getTransformDiagnosticsAttrs } from './transformDiagnostics';
import { NodeChrome } from './NodeChrome';
import { NodeTransformControls } from './NodeTransformControls';
import { useActiveNodeSelection } from './useActiveNodeSelection';
import { useTranslation } from 'react-i18next';
import { useProviderShapePreview } from '@/hooks/useProviderShapePreview';
import { useShiftHeld } from '@/hooks/useShiftHeld';
import { NodeShapeSVG } from './NodeShapeSVG';
import { DiffBadge, LintViolationBadge } from './NodeBadges';
import { IconAssetNodeBody } from './IconAssetNodeBody';
import { CustomNodeContent } from './CustomNodeContent';
import { readMermaidImportedNodeMetadataFromData } from '@/services/mermaid/importProvenance';
import { ChartDecisionSurface } from './ChartDecisionSurface';
import { getMermaidImportedContentPadding } from './customNodeMermaidHelpers';
import { buildCustomNodeTypography } from './customNodeTypography';
import {
  type NodeShape,
  COMPLEX_SHAPE_PADDING,
  buildChartNodeSurfaceStyle,
  getNodeDefaults,
  getNumericNodeDimension,
  getMinNodeSize,
  isDivShape,
  isSvgComplexShape,
  resolveChartNodeChipIcon,
  resolveChartNodeSurfaceVariant,
  resolveChartNodeTone,
  toCssSize,
  getNodeBorderRadius,
  NEEDS_SQUARE_ASPECT,
} from './nodeHelpers';

function CustomNode(props: LegacyNodeProps<NodeData>): React.ReactElement {
  const { id, data, type, selected } = props;
  const explicitNodeStyle = (props as { style?: React.CSSProperties }).style;
  const explicitWidth = data.width ?? explicitNodeStyle?.width;
  const explicitHeight = data.height ?? explicitNodeStyle?.height;
  const explicitWidthPx = getNumericNodeDimension(explicitWidth);
  const explicitHeightPx = getNumericNodeDimension(explicitHeight);
  const measuredHeight = (props as { height?: number }).height;
  const shiftHeld = useShiftHeld(Boolean(selected));
  const resolvedAssetIconUrl = useProviderShapePreview(
    typeof data.archIconPackId === 'string' ? data.archIconPackId : undefined,
    typeof data.archIconShapeId === 'string' ? data.archIconShapeId : undefined,
    typeof data.customIconUrl === 'string' ? data.customIconUrl : undefined
  );
  const designSystem = useDesignSystem();
  const isActiveSelected = useActiveNodeSelection(Boolean(selected));
  const { t } = useTranslation();

  const defaults = getNodeDefaults(type || 'process');
  const activeColor = data.color || defaults.color;
  const activeColorMode = data.colorMode || 'subtle';
  const activeIconKey = data.icon === 'none' ? null : data.icon || defaults.icon;
  const activeShape = (data.shape || defaults.shape || 'rounded') as NodeShape;
  const visualStyle = resolveNodeVisualStyle(activeColor, activeColorMode, data.customColor);
  const iconName = resolvedAssetIconUrl || !activeIconKey ? null : activeIconKey;
  const mermaidImportedNodeMetadata = readMermaidImportedNodeMetadataFromData(data);
  const isMermaidImportedLeaf = mermaidImportedNodeMetadata?.role === 'leaf';
  const nodeUsesDivShape = isDivShape(activeShape);
  const usesSvgComplexShape = isSvgComplexShape(activeShape);
  const surfaceVariant = resolveChartNodeSurfaceVariant(type || 'process', activeShape);
  const nodeTone = resolveChartNodeTone(type || 'process', activeShape);
  const chipIcon = resolveChartNodeChipIcon(type || 'process', activeShape, activeIconKey);
  const { minWidth: baseMinWidth, minHeight: baseMinHeight } = getMinNodeSize(activeShape);
  const hasSubLabel = Boolean(data.subLabel);
  const hasLabel = Boolean(data.label?.trim());
  const hasProviderIcon = Boolean(resolvedAssetIconUrl) || Boolean(data.archIconPackId);
  const hasIcon = Boolean(iconName) || Boolean(data.customIconUrl) || hasProviderIcon;
  const contentMinHeight = surfaceVariant === 'stadium'
    ? 46
    : !nodeUsesDivShape && !usesSvgComplexShape
      ? hasSubLabel
        ? 128
        : 108
      : baseMinHeight;
  const minWidth = isMermaidImportedLeaf ? explicitWidthPx ?? baseMinWidth : baseMinWidth;
  const effectiveMinHeight = isMermaidImportedLeaf
    ? explicitHeightPx ?? baseMinHeight
    : surfaceVariant === 'stadium'
      ? 46
      : Math.max(baseMinHeight, contentMinHeight);
  const nodeHeightPx = typeof measuredHeight === 'number' ? measuredHeight : explicitHeightPx;
  const isCompactNode = typeof nodeHeightPx === 'number' && nodeHeightPx < effectiveMinHeight + 8;
  const contentPadding = surfaceVariant === 'stadium'
    ? '0 18px 0 9px'
    : isMermaidImportedLeaf
      ? getMermaidImportedContentPadding(nodeHeightPx)
      : isCompactNode
        ? '0.5rem'
        : designSystem.components.node.padding;
  const labelEdit = useInlineNodeTextEdit(id, 'label', data.label || '', { multiline: true });
  const subLabelEdit = useInlineNodeTextEdit(id, 'subLabel', data.subLabel || '');
  const connectionHandleClass =
    '!w-2.5 !h-2.5 !border-2 !border-white transition-all duration-150 hover:scale-110';
  const emptyLabelPrompt = t('nodes.addText', 'Add text');
  const showEmptyLabelPrompt = !hasLabel && isActiveSelected;
  const lodPreserveClass = isActiveSelected ? 'flow-lod-preserve' : '';
  const isIconAssetNode =
    data.assetPresentation === 'icon' &&
    (Boolean(resolvedAssetIconUrl) || Boolean(activeIconKey) || Boolean(data.archIconPackId));

  const labelDisplayValue = hasLabel
    ? isMermaidImportedLeaf
      ? <span className="block whitespace-pre-wrap break-words">{data.label}</span>
      : <MemoizedMarkdown content={data.label} />
    : showEmptyLabelPrompt
      ? <span className="text-slate-400/80">{emptyLabelPrompt}</span>
      : null;

  const needsSquareAspect = NEEDS_SQUARE_ASPECT.has(activeShape);
  const animateIn = data.freshlyAdded === true;
  const repaintedSurface = surfaceVariant
    ? buildChartNodeSurfaceStyle({
        variant: surfaceVariant,
        designSystem,
        isSelected: isActiveSelected,
      })
    : null;
  const typography = buildCustomNodeTypography({
    data,
    designSystem,
    visualStyle,
    surfaceVariant,
    activeShape,
    isDivShape: nodeUsesDivShape,
    isMermaidImportedLeaf,
    nodeHeightPx,
  });
  const containerStyle: React.CSSProperties = {
    minWidth,
    minHeight: effectiveMinHeight,
    width: toCssSize(explicitWidth) ?? '100%',
    height: toCssSize(explicitHeight),
    ...(needsSquareAspect ? { aspectRatio: '1/1' } : {}),
    ...typography.labelFontFamilyStyle,
    boxShadow: repaintedSurface?.boxShadow ?? (usesSvgComplexShape ? 'none' : designSystem.components.node.boxShadow),
    borderWidth: repaintedSurface?.borderWidth ?? (!usesSvgComplexShape ? designSystem.components.node.borderWidth : 0),
    padding: 0,
    borderRadius: repaintedSurface?.borderRadius
      ?? getNodeBorderRadius(usesSvgComplexShape, activeShape, designSystem.components.node.borderRadius),
    background: repaintedSurface?.background,
    backgroundColor: repaintedSurface ? undefined : !usesSvgComplexShape ? visualStyle.bg : undefined,
    borderColor: repaintedSurface?.borderColor ?? (!usesSvgComplexShape ? visualStyle.border : undefined),
    ...(animateIn
      ? { animation: `nodeAnimateIn 180ms ease-out ${data.animateDelay ?? 0}ms both` }
      : {}),
  };
  const surfaceClassName = [
    'chart-node-surface',
    surfaceVariant ? `chart-node-surface--${surfaceVariant}` : '',
    'chart-node-surface--hoverable',
    isActiveSelected ? 'chart-node-surface--selected' : '',
  ].filter(Boolean).join(' ');
  const ariaLabelParts = [
    `${type || 'process'} node`,
    hasLabel ? String(data.label).trim() : emptyLabelPrompt,
    hasSubLabel ? String(data.subLabel).trim() : null,
    isActiveSelected ? 'selected' : null,
  ].filter(Boolean);
  const nodeAriaLabel = ariaLabelParts.join(', ');
  const diagnosticsAttrs = getTransformDiagnosticsAttrs({
    nodeFamily: 'custom',
    selected: Boolean(selected),
    compact: isCompactNode,
    minHeight: effectiveMinHeight,
    actualHeight: nodeHeightPx,
    hasIcon,
    hasSubLabel,
  });

  if (isIconAssetNode) {
    return (
      <IconAssetNodeBody
        nodeId={id}
        selected={Boolean(selected)}
        connectionHandleClass={connectionHandleClass}
        explicitWidth={explicitWidth}
        nodeHeightPx={nodeHeightPx}
        hasLabel={hasLabel}
        resolvedAssetIconUrl={resolvedAssetIconUrl}
        activeIconKey={activeIconKey}
        label={data.label}
        isActiveSelected={isActiveSelected}
        labelEdit={labelEdit}
      />
    );
  }

  const nodeContent = (
    <>
      <DiffBadge nodeId={id} />
      <LintViolationBadge nodeId={id} />

      {usesSvgComplexShape && (
        <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full overflow-visible drop-shadow-sm"
          >
            <NodeShapeSVG
              shape={activeShape}
              fill={visualStyle.bg}
              stroke={visualStyle.border}
              strokeWidth={designSystem.components.edge.strokeWidth || '2'}
            />
          </svg>
        </div>
      )}

      <CustomNodeContent
        data={data}
        hasSubLabel={hasSubLabel}
        resolvedAssetIconUrl={resolvedAssetIconUrl}
        chipIcon={chipIcon}
        tone={nodeTone}
        surfaceVariant={surfaceVariant}
        textAlignStyle={typography.textAlignStyle}
        textClassName={`leading-tight block break-words markdown-content [&_p]:m-0 [&_p]:leading-tight ${surfaceVariant ? '' : typography.fSizeClass} ${typography.labelFontFamilyClass}`}
        textStyle={typography.textProps}
        subTextClassName={`${surfaceVariant ? 'mt-1' : 'text-slate-500 mt-1'} leading-snug markdown-content [&_p]:m-0 [&_p]:leading-snug break-words flow-lod-secondary ${lodPreserveClass} ${surfaceVariant ? '' : typography.subLabelSizeClass} ${typography.subLabelFontFamilyClass}`}
        subTextStyle={typography.subTextProps}
        displayLabel={labelDisplayValue}
        labelEdit={labelEdit}
        subLabelEdit={subLabelEdit}
        hasLabelSelection={isActiveSelected}
        hasSubLabelSelection={Boolean(selected)}
        lodPreserveClassName={lodPreserveClass}
        isDivShape={nodeUsesDivShape}
        isSvgComplexShape={usesSvgComplexShape}
        complexShapePaddingClassName={COMPLEX_SHAPE_PADDING[activeShape] ?? ''}
        contentPadding={contentPadding}
      />
    </>
  );

  return (
    <>
      <NodeTransformControls
        isVisible={Boolean(selected)}
        minWidth={minWidth}
        minHeight={effectiveMinHeight}
        keepAspectRatio={shiftHeld || needsSquareAspect}
      />
      <NodeChrome
        nodeId={id}
        selected={Boolean(selected)}
        minWidth={minWidth}
        minHeight={effectiveMinHeight}
        keepAspectRatio={shiftHeld || needsSquareAspect}
        handleClassName={connectionHandleClass}
      >
        {nodeUsesDivShape ? (
          <ChartDecisionSurface
            designSystem={designSystem}
            isSelected={isActiveSelected}
            surfaceClassName={surfaceClassName}
            diagnosticsAttrs={diagnosticsAttrs}
            ariaLabel={nodeAriaLabel}
          >
            {nodeContent}
          </ChartDecisionSurface>
        ) : (
          <div
            role="group"
            aria-roledescription="canvas node"
            aria-label={nodeAriaLabel}
            className={`relative group flex flex-col justify-center h-full border transition-all duration-200 flow-lod-shadow ${surfaceClassName} ${usesSvgComplexShape ? 'overflow-hidden' : 'overflow-visible'}`}
            style={containerStyle}
            {...diagnosticsAttrs}
          >
            {nodeContent}
          </div>
        )}
      </NodeChrome>
    </>
  );
}

export default memo(CustomNode);

