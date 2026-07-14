import type { AddItemId } from '@/components/add-items/addItemRegistry';
import type { ChartNodeTone, NodeData } from '@/lib/types';

export type ChartElementNodeShape = NonNullable<NodeData['shape']>;

export interface ChartElementVisualSpec {
  tone: ChartNodeTone;
  chipIcon: string | null;
}

export const CHART_ELEMENT_ADD_ITEM_IDS: readonly AddItemId[] = [
  'start',
  'end',
  'process',
  'decision',
  'io',
  'database',
  'annotation',
] as const;

export const CHART_ELEMENT_VISUAL_SPECS: Record<AddItemId, ChartElementVisualSpec> = {
  start: { tone: 'out', chipIcon: 'Play' },
  end: { tone: 'end', chipIcon: 'CheckCircle' },
  process: { tone: 'web', chipIcon: 'Square' },
  decision: { tone: 'cond', chipIcon: 'HelpCircle' },
  io: { tone: 'kb', chipIcon: 'Download' },
  database: { tone: 'llm', chipIcon: 'Database' },
  annotation: { tone: 'note', chipIcon: null },
};

export function getChartElementVisualSpec(id: AddItemId): ChartElementVisualSpec {
  return CHART_ELEMENT_VISUAL_SPECS[id];
}

export function chartElementToneVars(tone: ChartNodeTone): {
  background: string;
  foreground: string;
} {
  return {
    background: `var(--wf-t-${tone}-bg)`,
    foreground: `var(--wf-t-${tone}-fg)`,
  };
}

export function resolveAddItemIdFromNode(
  nodeType: string,
  shape: ChartElementNodeShape
): AddItemId | null {
  if (nodeType === 'start') return 'start';
  if (nodeType === 'end') return 'end';
  if (nodeType === 'process') return 'process';
  if (nodeType === 'decision') return 'decision';
  if (nodeType === 'annotation') return 'annotation';
  if (nodeType === 'custom' && shape === 'parallelogram') return 'io';
  if (nodeType === 'custom' && shape === 'cylinder') return 'database';
  return null;
}

export function resolveChartElementToneFromNode(
  nodeType: string,
  shape: ChartElementNodeShape
): ChartNodeTone | null {
  const addItemId = resolveAddItemIdFromNode(nodeType, shape);
  if (!addItemId || addItemId === 'annotation') {
    return null;
  }
  return getChartElementVisualSpec(addItemId).tone;
}

export function resolveChartElementChipIconFromNode(
  nodeType: string,
  shape: ChartElementNodeShape
): string | null {
  const addItemId = resolveAddItemIdFromNode(nodeType, shape);
  if (!addItemId || addItemId === 'annotation') {
    return null;
  }
  return getChartElementVisualSpec(addItemId).chipIcon;
}