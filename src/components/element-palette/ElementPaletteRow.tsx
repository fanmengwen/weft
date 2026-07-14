import React from 'react';
import type { AddItemDefinition } from '@/components/add-items/addItemRegistry';
import { ELEMENT_PALETTE_CHIP_TONES } from './elementPaletteTone';

interface ElementPaletteRowProps {
  item: AddItemDefinition;
  onSelect: () => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
}

export function ElementPaletteRow({
  item,
  onSelect,
  onDragStart,
}: ElementPaletteRowProps): React.ReactElement {
  const tone = ELEMENT_PALETTE_CHIP_TONES[item.id];

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      data-testid={`element-palette-item-${item.id}`}
      className="flex cursor-grab items-center gap-2 rounded-[7px] px-1 py-0.5 hover:bg-[#F3F5F8]"
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      onDragStart={onDragStart}
    >
      <div
        className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px]"
        style={{
          backgroundColor: tone.background,
          color: tone.foreground,
        }}
      >
        {item.renderIcon('h-[14px] w-[14px]')}
      </div>
      <span className="text-[12.5px] font-medium leading-none text-[var(--brand-text)]">
        {item.label}
      </span>
    </div>
  );
}
