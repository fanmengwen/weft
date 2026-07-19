import type { AddItemId } from '@/components/add-items/addItemRegistry';
import {
  CHART_ELEMENT_ADD_ITEM_IDS,
  chartElementToneVars,
  getChartElementVisualSpec,
} from '@/components/chartElementVisualSpec';

export interface ElementPaletteChipTone {
  background: string;
  foreground: string;
}

export const ELEMENT_PALETTE_CHIP_TONES = Object.fromEntries(
  CHART_ELEMENT_ADD_ITEM_IDS.map((id) => [id, chartElementToneVars(getChartElementVisualSpec(id).tone)])
) as Record<AddItemId, ElementPaletteChipTone>;