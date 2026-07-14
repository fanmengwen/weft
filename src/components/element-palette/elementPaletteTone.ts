import type { AddItemId } from '@/components/add-items/addItemRegistry';

export interface ElementPaletteChipTone {
  background: string;
  foreground: string;
}

export const ELEMENT_PALETTE_CHIP_TONES: Record<AddItemId, ElementPaletteChipTone> = {
  start: {
    background: 'var(--wf-t-out-bg)',
    foreground: 'var(--wf-t-out-fg)',
  },
  end: {
    background: 'var(--wf-t-end-bg)',
    foreground: 'var(--wf-t-end-fg)',
  },
  process: {
    background: 'var(--wf-t-web-bg)',
    foreground: 'var(--wf-t-web-fg)',
  },
  decision: {
    background: 'var(--wf-t-cond-bg)',
    foreground: 'var(--wf-t-cond-fg)',
  },
  io: {
    background: 'var(--wf-t-kb-bg)',
    foreground: 'var(--wf-t-kb-fg)',
  },
  database: {
    background: 'var(--wf-t-llm-bg)',
    foreground: 'var(--wf-t-llm-fg)',
  },
  annotation: {
    background: 'var(--wf-t-note-bg)',
    foreground: 'var(--wf-t-note-fg)',
  },
};
