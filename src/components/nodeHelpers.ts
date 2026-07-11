import type { DesignSystem, FlowNode, NodeData } from '@/lib/types';

export type NodeShape = NonNullable<NodeData['shape']>;

export const DIV_SHAPES: NodeShape[] = ['diamond'];

export const SVG_COMPLEX_SHAPES: NodeShape[] = ['parallelogram', 'cylinder'];

export const LEGACY_SHAPE_FALLBACKS: NodeShape[] = [
  'hexagon',
  'circle',
  'ellipse',
  'rectangle',
  'capsule',
];

export function isDivShape(shape: NodeShape): boolean {
  return DIV_SHAPES.includes(shape);
}

export function isSvgComplexShape(shape: NodeShape): boolean {
  return SVG_COMPLEX_SHAPES.includes(shape);
}

export function isLegacyShapeFallback(shape: NodeShape): boolean {
  return LEGACY_SHAPE_FALLBACKS.includes(shape);
}

export const FONT_FAMILY_MAP: Record<string, string> = {
  inter: 'font-inter',
  roboto: 'font-roboto',
  outfit: 'font-outfit',
  playfair: 'font-playfair',
  fira: 'font-fira',
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
};

export function getNodeDefaults(type: string): {
  color: string;
  icon: string | null;
  shape: NodeShape;
} {
  switch (type) {
    case 'start':
      return { color: 'emerald', icon: null, shape: 'rounded' };
    case 'end':
      return { color: 'red', icon: null, shape: 'rounded' };
    case 'decision':
      return { color: 'amber', icon: null, shape: 'diamond' };
    case 'annotation':
      return { color: 'yellow', icon: null, shape: 'rounded' };
    case 'custom':
      return { color: 'white', icon: null, shape: 'rounded' };
    default:
      return { color: 'white', icon: null, shape: 'rounded' };
  }
}

export function getMinNodeSize(shape: NodeData['shape'] | undefined): {
  minWidth: number;
  minHeight: number;
} {
  switch (shape) {
    case 'circle':
    case 'ellipse':
      return { minWidth: 120, minHeight: 120 };
    case 'diamond':
      return { minWidth: 148, minHeight: 148 };
    case 'hexagon':
      return { minWidth: 140, minHeight: 140 };
    case 'parallelogram':
    case 'cylinder':
      return { minWidth: 140, minHeight: 80 };
    default:
      return { minWidth: 120, minHeight: 60 };
  }
}

export function getIconAssetNodeMinSize(hasLabel: boolean): {
  minWidth: number;
  minHeight: number;
} {
  return hasLabel
    ? { minWidth: 116, minHeight: 118 }
    : { minWidth: 96, minHeight: 88 };
}

export function resolveNodeSize(node: FlowNode): { width: number; height: number } {
  if (node.type === 'mermaid_svg') {
    const styleWidth = typeof node.style?.width === 'number' ? node.style.width : undefined;
    const styleHeight = typeof node.style?.height === 'number' ? node.style.height : undefined;
    const dataWidth = typeof node.data?.width === 'number' ? node.data.width : undefined;
    const dataHeight = typeof node.data?.height === 'number' ? node.data.height : undefined;
    const nodeWidth = typeof node.width === 'number' ? node.width : undefined;
    const nodeHeight = typeof node.height === 'number' ? node.height : undefined;

    return {
      width: dataWidth ?? styleWidth ?? nodeWidth ?? 640,
      height: dataHeight ?? styleHeight ?? nodeHeight ?? 480,
    };
  }

  const minSize = node.data?.assetPresentation === 'icon'
    ? getIconAssetNodeMinSize(Boolean(node.data?.label?.trim()))
    : getMinNodeSize(node.data?.shape);
  const styleWidth = typeof node.style?.width === 'number' ? node.style.width : undefined;
  const styleHeight = typeof node.style?.height === 'number' ? node.style.height : undefined;
  const dataWidth = typeof node.data?.width === 'number' ? node.data.width : undefined;
  const dataHeight = typeof node.data?.height === 'number' ? node.data.height : undefined;
  const nodeWidth = typeof node.width === 'number' ? node.width : undefined;
  const nodeHeight = typeof node.height === 'number' ? node.height : undefined;

  return {
    width: dataWidth ?? styleWidth ?? nodeWidth ?? minSize.minWidth,
    height: dataHeight ?? styleHeight ?? nodeHeight ?? minSize.minHeight,
  };
}

export function toCssSize(value: number | string | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

export function getNumericNodeDimension(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function getNodeBorderRadius(
  isComplexShape: boolean,
  activeShape: NodeShape,
  borderRadius: string | number
): string | number {
  if (isComplexShape) return '0';
  if (activeShape === 'capsule') return '9999px';
  if (activeShape === 'rectangle') return '4px';
  return borderRadius;
}

export function fontSizeClassFor(fontSize: string | undefined): string {
  if (!fontSize || !isNaN(Number(fontSize))) return '';
  switch (fontSize) {
    case 'small':
      return 'text-xs';
    case 'medium':
      return 'text-sm';
    case 'large':
      return 'text-base';
    default:
      return 'text-lg';
  }
}

export const NEEDS_SQUARE_ASPECT: Set<NodeShape> = new Set(['diamond']);

export const COMPLEX_SHAPE_PADDING: Partial<Record<NodeShape, string>> = {
  parallelogram: 'px-8',
  cylinder: 'pt-8 pb-4',
};

export type ChartNodeTone = 'out' | 'end' | 'web' | 'cond' | 'kb' | 'llm';

export type ChartNodeSurfaceVariant = 'stadium' | 'rounded';

export const CHART_NODE_SURFACE_GRADIENT =
  'linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)';

export function resolveChartNodeSurfaceVariant(
  nodeType: string,
  shape: NodeShape
): ChartNodeSurfaceVariant | null {
  if (isDivShape(shape) || isSvgComplexShape(shape)) {
    return null;
  }
  if (nodeType === 'start' || nodeType === 'end') {
    return 'stadium';
  }
  return 'rounded';
}

export function resolveChartNodeTone(nodeType: string, shape: NodeShape): ChartNodeTone {
  if (nodeType === 'start') {
    return 'out';
  }
  if (nodeType === 'end') {
    return 'end';
  }
  if (nodeType === 'decision') {
    return 'cond';
  }
  if (nodeType === 'custom' && shape === 'parallelogram') {
    return 'kb';
  }
  if (nodeType === 'custom' && shape === 'cylinder') {
    return 'llm';
  }
  return 'web';
}

export function resolveChartNodeChipIcon(
  nodeType: string,
  shape: NodeShape,
  dataIcon: string | null
): string {
  if (dataIcon) {
    return dataIcon;
  }
  if (nodeType === 'start') {
    return 'Play';
  }
  if (nodeType === 'end') {
    return 'CheckCircle';
  }
  if (nodeType === 'decision') {
    return 'HelpCircle';
  }
  if (nodeType === 'custom' && shape === 'parallelogram') {
    return 'Download';
  }
  if (nodeType === 'custom' && shape === 'cylinder') {
    return 'Database';
  }
  return 'Square';
}

export function buildChartNodeSurfaceStyle(options: {
  variant: ChartNodeSurfaceVariant;
  designSystem: DesignSystem;
  isSelected: boolean;
}): {
  background: string;
  borderColor: string;
  borderWidth: string;
  boxShadow: string;
  borderRadius: string | number;
} {
  const { variant, designSystem, isSelected } = options;
  return {
    background: CHART_NODE_SURFACE_GRADIENT,
    borderColor: isSelected ? 'var(--wf-acc)' : designSystem.colors.nodeBorder,
    borderWidth: isSelected ? '1.5px' : designSystem.components.node.borderWidth,
    boxShadow: isSelected
      ? 'var(--wf-shadow-node-selected)'
      : designSystem.components.node.boxShadow,
    borderRadius:
      variant === 'stadium' ? '999px' : designSystem.components.node.borderRadius,
  };
}

export function chartNodeToneVars(tone: ChartNodeTone): { background: string; color: string } {
  return {
    background: `var(--wf-t-${tone}-bg)`,
    color: `var(--wf-t-${tone}-fg)`,
  };
}

