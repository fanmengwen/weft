import {
  getAddItemDefinitions,
  type AddItemId,
} from '@/components/add-items/addItemRegistry';
import type { TFunction } from 'i18next';

export const WEFT_ADD_ITEM_MIME = 'application/weft-add-item';

const identityT = ((key: string) => key) as TFunction;

const KNOWN_ADD_ITEM_IDS = new Set<AddItemId>(
  getAddItemDefinitions(identityT).map((definition) => definition.id),
);

export function isKnownAddItemId(id: string): id is AddItemId {
  return KNOWN_ADD_ITEM_IDS.has(id as AddItemId);
}

export function setAddItemDragData(dataTransfer: DataTransfer, itemId: AddItemId): void {
  dataTransfer.setData(WEFT_ADD_ITEM_MIME, itemId);
  dataTransfer.setData('text/plain', itemId);
  dataTransfer.effectAllowed = 'copy';
}

export function getAddItemDragData(dataTransfer: DataTransfer): AddItemId | null {
  const raw = dataTransfer.getData(WEFT_ADD_ITEM_MIME);
  if (!raw || !isKnownAddItemId(raw)) {
    return null;
  }

  return raw;
}
