import { describe, expect, it } from 'vitest';
import type { AddItemId } from '@/components/add-items/addItemRegistry';
import type { ChartNodeTone } from '@/lib/types';
import {
  CHART_ELEMENT_ADD_ITEM_IDS,
  CHART_ELEMENT_VISUAL_SPECS,
  chartElementToneVars,
  getChartElementVisualSpec,
  resolveAddItemIdFromNode,
} from './chartElementVisualSpec';
import { resolveChartNodeChipIcon, resolveChartNodeTone } from './nodeHelpers';

const EXPECTED_TONES: Record<AddItemId, ChartNodeTone> = {
  start: 'out',
  end: 'end',
  process: 'web',
  decision: 'cond',
  io: 'kb',
  database: 'llm',
  annotation: 'note',
};

const EXPECTED_CHIP_ICONS: Partial<Record<AddItemId, string>> = {
  start: 'Play',
  end: 'CheckCircle',
  process: 'Square',
  decision: 'HelpCircle',
  io: 'Download',
  database: 'Database',
};

describe('chartElementVisualSpec', () => {
  it('defines visual specs for all seven palette add items', () => {
    expect(CHART_ELEMENT_ADD_ITEM_IDS).toHaveLength(7);
    expect(CHART_ELEMENT_ADD_ITEM_IDS).toEqual([
      'start',
      'end',
      'process',
      'decision',
      'io',
      'database',
      'annotation',
    ]);
    for (const id of CHART_ELEMENT_ADD_ITEM_IDS) {
      expect(CHART_ELEMENT_VISUAL_SPECS[id]).toBeDefined();
      expect(getChartElementVisualSpec(id)).toBe(CHART_ELEMENT_VISUAL_SPECS[id]);
    }
  });

  it.each(Object.entries(EXPECTED_TONES) as Array<[AddItemId, ChartNodeTone]>)(
    'maps %s to tone %s',
    (id, tone) => {
      expect(getChartElementVisualSpec(id).tone).toBe(tone);
    }
  );

  it.each(Object.entries(EXPECTED_CHIP_ICONS) as Array<[AddItemId, string]>)(
    'maps %s to chip icon %s',
    (id, chipIcon) => {
      expect(getChartElementVisualSpec(id).chipIcon).toBe(chipIcon);
    }
  );

  it('maps annotation tone without a canvas chip icon', () => {
    expect(getChartElementVisualSpec('annotation').tone).toBe('note');
    expect(getChartElementVisualSpec('annotation').chipIcon).toBeNull();
  });

  it('maps palette tone CSS variables from chart element tones', () => {
    for (const id of CHART_ELEMENT_ADD_ITEM_IDS) {
      const { tone } = getChartElementVisualSpec(id);
      expect(chartElementToneVars(tone)).toEqual({
        background: `var(--wf-t-${tone}-bg)`,
        foreground: `var(--wf-t-${tone}-fg)`,
      });
    }
  });

  it('resolves add item ids from chart node type and shape', () => {
    expect(resolveAddItemIdFromNode('start', 'capsule')).toBe('start');
    expect(resolveAddItemIdFromNode('end', 'capsule')).toBe('end');
    expect(resolveAddItemIdFromNode('process', 'rounded')).toBe('process');
    expect(resolveAddItemIdFromNode('decision', 'diamond')).toBe('decision');
    expect(resolveAddItemIdFromNode('custom', 'parallelogram')).toBe('io');
    expect(resolveAddItemIdFromNode('custom', 'cylinder')).toBe('database');
    expect(resolveAddItemIdFromNode('annotation', 'rounded')).toBe('annotation');
    expect(resolveAddItemIdFromNode('custom', 'rounded')).toBeNull();
  });
});

describe('nodeHelpers chart element wiring', () => {
  it('derives chart node tones from the visual spec mapping', () => {
    expect(resolveChartNodeTone('start', 'capsule')).toBe('out');
    expect(resolveChartNodeTone('end', 'capsule')).toBe('end');
    expect(resolveChartNodeTone('process', 'rounded')).toBe('web');
    expect(resolveChartNodeTone('decision', 'diamond')).toBe('cond');
    expect(resolveChartNodeTone('custom', 'parallelogram')).toBe('kb');
    expect(resolveChartNodeTone('custom', 'cylinder')).toBe('llm');
    expect(resolveChartNodeTone('custom', 'rounded')).toBe('web');
  });

  it('derives default chart node chip icons from the visual spec mapping', () => {
    expect(resolveChartNodeChipIcon('start', 'capsule', null)).toBe('Play');
    expect(resolveChartNodeChipIcon('process', 'rounded', null)).toBe('Square');
    expect(resolveChartNodeChipIcon('custom', 'parallelogram', null)).toBe('Download');
    expect(resolveChartNodeChipIcon('end', 'capsule', null)).toBe('CheckCircle');
    expect(resolveChartNodeChipIcon('decision', 'diamond', null)).toBe('HelpCircle');
    expect(resolveChartNodeChipIcon('custom', 'cylinder', null)).toBe('Database');
    expect(resolveChartNodeChipIcon('process', 'rounded', 'Settings')).toBe('Settings');
  });
});