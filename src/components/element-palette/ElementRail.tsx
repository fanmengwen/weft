import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/Tooltip';
import {
  getAddItemDefinitionById,
  type AddItemActions,
  type AddItemSectionId,
} from '@/components/add-items/addItemRegistry';
import { getToolbarIconButtonClass } from '@/components/toolbar/toolbarButtonStyles';
import { ElementRailDirectItem } from './ElementRailItem';
import { ElementRailFlyout } from './ElementRailFlyout';
import { PALETTE_RAIL_ENTRIES, getPaletteGroupId } from './paletteRailConfig';

interface ElementRailProps {
  addItemActions: AddItemActions;
  getCenter: () => { x: number; y: number };
  isVisible: boolean;
  isInteractive: boolean;
}

export function ElementRail({
  addItemActions,
  getCenter,
  isVisible,
  isInteractive,
}: ElementRailProps): React.ReactElement | null {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState<AddItemSectionId | null>(null);

  const containerClasses = useMemo(
    () =>
      [
        'absolute left-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-1 rounded-[var(--radius-xl)] border border-[var(--brand-glass-border)] bg-[var(--brand-glass-bg)] p-1.5 shadow-[var(--shadow-floating)] backdrop-blur-xl transition-all duration-300',
        !isInteractive ? 'pointer-events-none opacity-60' : '',
      ]
        .filter(Boolean)
        .join(' '),
    [isInteractive]
  );

  if (!isVisible) {
    return null;
  }

  const handleToggleSection = (sectionId: AddItemSectionId) => {
    if (!isInteractive) {
      return;
    }

    setOpenSection((current) => (current === sectionId ? null : sectionId));
  };

  return (
    <div
      data-testid="element-rail"
      className={containerClasses}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {PALETTE_RAIL_ENTRIES.map((entry) => {
        if (entry.kind === 'divider') {
          return (
            <div
              key={entry.id}
              className="my-0.5 h-px bg-[var(--color-brand-border)]/80"
              aria-hidden="true"
            />
          );
        }

        if (entry.kind === 'item') {
          const definition = getAddItemDefinitionById(entry.id, t);

          return (
            <Tooltip key={entry.id} text={definition.label}>
              <ElementRailDirectItem
                itemId={entry.id}
                icon={definition.renderIcon('h-4 w-4')}
                label={definition.label}
                addItemActions={addItemActions}
                getCenter={getCenter}
                isInteractive={isInteractive}
              />
            </Tooltip>
          );
        }

        const Icon = entry.icon;
        const isOpen = openSection === entry.section;
        const tooltipLabel = t(entry.tooltipKey, entry.section);

        return (
          <div key={entry.id} className="relative">
            <Tooltip text={tooltipLabel}>
              <Button
                type="button"
                data-testid={`element-rail-group-${entry.section}`}
                onClick={() => handleToggleSection(entry.section)}
                variant="ghost"
                className={getToolbarIconButtonClass({ active: isOpen, tone: isOpen ? 'brand' : 'neutral' })}
                icon={<Icon className="h-4 w-4" />}
                aria-label={tooltipLabel}
                aria-expanded={isOpen}
              />
            </Tooltip>
            {isOpen ? (
              <ElementRailFlyout
                sectionId={entry.section}
                addItemActions={addItemActions}
                getCenter={getCenter}
                isInteractive={isInteractive}
                onClose={() => setOpenSection(null)}
                onDragStart={() => setOpenSection(null)}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export { getPaletteGroupId };
