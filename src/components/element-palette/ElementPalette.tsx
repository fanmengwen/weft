import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  executeAddItem,
  getAddItemDefinitions,
  type AddItemActions,
  type AddItemId,
} from '@/components/add-items/addItemRegistry';
import { setAddItemDragData } from './elementPaletteDnD';
import { ElementPaletteRow } from './ElementPaletteRow';

export interface ElementPaletteProps {
  addItemActions: AddItemActions;
  getCenter: () => { x: number; y: number };
  onOpenAssets: () => void;
  className?: string;
}

export function ElementPalette({
  addItemActions,
  getCenter,
  onOpenAssets,
  className,
}: ElementPaletteProps): React.ReactElement {
  const { t } = useTranslation();
  const items = getAddItemDefinitions(t);

  function handleSelectItem(itemId: AddItemId): void {
    executeAddItem(itemId, addItemActions, getCenter());
  }

  function handleDragStart(itemId: AddItemId, event: React.DragEvent<HTMLDivElement>): void {
    setAddItemDragData(event.dataTransfer, itemId);
  }

  const panelClassName = [
    'w-[184px] rounded-[12px] border border-[#E6E8EC] bg-[#FFFFFF] p-[5px] shadow-[0_2px_8px_rgba(16,24,40,0.08)]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={panelClassName} data-testid="element-palette">
      <div className="px-1 pb-1 text-[11px] leading-none text-[#98A1AE]">
        {t('elementPalette.title')}
      </div>

      <div className="flex flex-col">
        {items.map((item) => (
          <ElementPaletteRow
            key={item.id}
            item={item}
            onSelect={() => handleSelectItem(item.id)}
            onDragStart={(event) => handleDragStart(item.id, event)}
          />
        ))}
      </div>

      <div className="my-1 h-px bg-[#EEF0F4]" />

      <button
        type="button"
        data-testid="element-palette-asset-library"
        className="w-full rounded-[7px] px-1 py-1 text-left text-[12.5px] font-medium leading-none text-[var(--brand-text)] hover:bg-[#F3F5F8]"
        onClick={onOpenAssets}
      >
        {t('elementPalette.assetLibrary')}
      </button>

      <p className="px-1 pt-1 text-[10px] leading-snug text-[#98A1AE]">
        {t('elementPalette.dragHint')}
      </p>
    </div>
  );
}
