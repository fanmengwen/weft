import React from 'react';
import { Button } from '@/components/ui/Button';
import {
  executeAddItem,
  type AddItemActions,
  type AddItemDefinition,
  type AddItemId,
} from '@/components/add-items/addItemRegistry';
import { setAddItemDragData } from './elementPaletteDnD';

interface ElementRailItemProps {
  item: AddItemDefinition;
  addItemActions: AddItemActions;
  getCenter: () => { x: number; y: number };
  isInteractive: boolean;
  variant?: 'icon' | 'tile';
  onDragStart?: () => void;
}

export function ElementRailItem({
  item,
  addItemActions,
  getCenter,
  isInteractive,
  variant = 'tile',
  onDragStart,
}: ElementRailItemProps): React.ReactElement {
  const handleDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
    if (!isInteractive) {
      event.preventDefault();
      return;
    }

    setAddItemDragData(event.dataTransfer, item.id);
    onDragStart?.();

    if (variant === 'tile' && event.currentTarget) {
      event.dataTransfer.setDragImage(event.currentTarget, 24, 16);
    }
  };

  const handleClick = () => {
    if (!isInteractive) {
      return;
    }

    executeAddItem(item.id, addItemActions, getCenter());
  };

  if (variant === 'icon') {
    return (
      <Button
        type="button"
        draggable={isInteractive}
        onDragStart={handleDragStart}
        onClick={handleClick}
        variant="ghost"
        className="h-9 w-9 cursor-grab rounded-[var(--radius-md)] p-0 active:cursor-grabbing hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)]"
        icon={item.renderIcon('h-4 w-4')}
        aria-label={item.label}
      />
    );
  }

  return (
    <Button
      type="button"
      draggable={isInteractive}
      onDragStart={handleDragStart}
      onClick={handleClick}
      variant="ghost"
      className="h-8 cursor-grab justify-start rounded-[var(--radius-sm)] px-2 text-xs transition-colors hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] active:cursor-grabbing"
      icon={item.renderIcon('h-4 w-4')}
    >
      {item.label}
    </Button>
  );
}

export function ElementRailDirectItem({
  itemId,
  icon,
  label,
  addItemActions,
  getCenter,
  isInteractive,
}: {
  itemId: AddItemId;
  icon: React.ReactElement;
  label: string;
  addItemActions: AddItemActions;
  getCenter: () => { x: number; y: number };
  isInteractive: boolean;
}): React.ReactElement {
  const handleDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
    if (!isInteractive) {
      event.preventDefault();
      return;
    }

    setAddItemDragData(event.dataTransfer, itemId);
  };

  const handleClick = () => {
    if (!isInteractive) {
      return;
    }

    executeAddItem(itemId, addItemActions, getCenter());
  };

  return (
    <Button
      type="button"
      draggable={isInteractive}
      onDragStart={handleDragStart}
      onClick={handleClick}
      variant="ghost"
      className="h-9 w-9 cursor-grab rounded-[var(--radius-md)] p-0 active:cursor-grabbing hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)]"
      icon={icon}
      aria-label={label}
    />
  );
}
