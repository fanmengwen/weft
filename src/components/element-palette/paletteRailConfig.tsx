import type { LucideIcon } from 'lucide-react';
import { LayoutTemplate, Network, Shapes, StickyNote, Type } from 'lucide-react';
import type { AddItemId, AddItemSectionId } from '@/components/add-items/addItemRegistry';

export type PaletteRailEntry =
  | {
      kind: 'group';
      id: string;
      section: AddItemSectionId;
      icon: LucideIcon;
      tooltipKey: string;
    }
  | {
      kind: 'item';
      id: AddItemId;
      icon: LucideIcon;
      tooltipKey?: string;
    }
  | {
      kind: 'divider';
      id: string;
    };

export const PALETTE_RAIL_ENTRIES: PaletteRailEntry[] = [
  {
    kind: 'group',
    id: 'shapes-group',
    section: 'shapes',
    icon: Shapes,
    tooltipKey: 'toolbar.shapes',
  },
  {
    kind: 'item',
    id: 'text',
    icon: Type,
    tooltipKey: 'toolbar.text',
  },
  {
    kind: 'item',
    id: 'sticky-note',
    icon: StickyNote,
    tooltipKey: 'toolbar.stickyNote',
  },
  {
    kind: 'divider',
    id: 'diagram-divider',
  },
  {
    kind: 'group',
    id: 'diagrams-group',
    section: 'diagrams',
    icon: Network,
    tooltipKey: 'toolbar.diagrams',
  },
  {
    kind: 'group',
    id: 'wireframes-group',
    section: 'wireframes',
    icon: LayoutTemplate,
    tooltipKey: 'toolbar.wireframes',
  },
];

export function getPaletteGroupId(section: AddItemSectionId): string {
  return `${section}-group`;
}
