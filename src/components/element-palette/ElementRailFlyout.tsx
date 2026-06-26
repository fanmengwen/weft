import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAddItemsForScope,
  getAddItemSections,
  type AddItemActions,
  type AddItemSectionId,
} from '@/components/add-items/addItemRegistry';
import { ElementRailItem } from './ElementRailItem';

interface ElementRailFlyoutProps {
  sectionId: AddItemSectionId;
  addItemActions: AddItemActions;
  getCenter: () => { x: number; y: number };
  isInteractive: boolean;
  onClose: () => void;
  onDragStart: () => void;
}

export function ElementRailFlyout({
  sectionId,
  addItemActions,
  getCenter,
  isInteractive,
  onClose,
  onDragStart,
}: ElementRailFlyoutProps): React.ReactElement {
  const { t } = useTranslation();
  const flyoutRef = useRef<HTMLDivElement>(null);
  const sections = getAddItemSections(t);
  const items = getAddItemsForScope('toolbar', t).filter((item) => item.section === sectionId);
  const sectionTitle = sections.find((section) => section.id === sectionId)?.title ?? sectionId;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={flyoutRef}
      data-testid={`element-rail-flyout-${sectionId}`}
      className="absolute left-full top-0 z-40 ml-2 w-64 rounded-[var(--radius-lg)] border border-[var(--color-brand-border)]/80 bg-[var(--brand-surface)]/95 p-2 shadow-[var(--shadow-md)] ring-1 ring-black/5 backdrop-blur-md"
    >
      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-secondary)]">
        {sectionTitle}
      </div>
      <div className="grid grid-cols-2 gap-0.5">
        {items.map((item) => (
          <ElementRailItem
            key={item.id}
            item={item}
            addItemActions={addItemActions}
            getCenter={getCenter}
            isInteractive={isInteractive}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
}
