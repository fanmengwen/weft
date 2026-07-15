import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Workflow } from 'lucide-react';
import { Button } from './ui/Button';
import { Tooltip } from './Tooltip';
import { ElementPalette } from './element-palette/ElementPalette';
import { ToolbarHistoryControls } from './toolbar/ToolbarHistoryControls';
import { ToolbarModeControls } from './toolbar/ToolbarModeControls';
import {
  TOOLBAR_CONTAINER_CLASS,
  TOOLBAR_DIVIDER_CLASS,
  TOOLBAR_ICON_CLASS,
  TOOLBAR_ICON_DISABLED_CLASS,
  TOOLBAR_PALETTE_OFFSET_CLASS,
  TOOLBAR_RAIL_CLASS,
  getToolbarAddButtonClasses,
  getToolbarIconButtonClass,
} from './toolbar/toolbarButtonStyles';
import { useMousedownOutside } from '@/hooks/useMousedownOutside';
import type { AddShapeInput } from '@/components/add-items/addItemRegistry';
import type { FlowEditorMode } from '@/hooks/useFlowEditorUIState';

interface ToolbarProps {
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
  onToggleSelectMode: () => void;
  isSelectMode: boolean;
  onTogglePanMode: () => void;
  isCommandBarOpen: boolean;
  editorMode: FlowEditorMode;
  isElementPaletteOpen: boolean;
  onToggleElementPalette: () => void;
  onCloseElementPalette: () => void;
  onOpenAssets: () => void;
  onAddShape: (input: AddShapeInput, position: { x: number; y: number }) => void;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onAddSection: (position: { x: number; y: number }) => void;
  onLayout: () => void;
  getCenter: () => { x: number; y: number };
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  canUndo,
  onRedo,
  canRedo,
  onToggleSelectMode,
  isSelectMode,
  onTogglePanMode,
  isCommandBarOpen,
  editorMode,
  isElementPaletteOpen,
  onToggleElementPalette,
  onCloseElementPalette,
  onOpenAssets,
  onAddShape,
  onAddAnnotation,
  onAddSection,
  onLayout,
  getCenter,
}) => {
  const { t } = useTranslation();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const isInteractive = !isCommandBarOpen;
  const shouldShowPalette =
    isElementPaletteOpen && isInteractive && editorMode === 'canvas';
  const { button: addButtonClass, icon: addIconClass } = getToolbarAddButtonClasses({
    open: shouldShowPalette,
    interactive: isInteractive,
  });

  useMousedownOutside(toolbarRef, onCloseElementPalette);

  return (
    <div ref={toolbarRef} className={TOOLBAR_CONTAINER_CLASS}>
      <div className="relative">
        <div data-testid="toolbar-rail" className={TOOLBAR_RAIL_CLASS}>
          <ToolbarModeControls
            isInteractive={isInteractive}
            isSelectMode={isSelectMode}
            onToggleSelectMode={onToggleSelectMode}
            onTogglePanMode={onTogglePanMode}
          />

          <div data-testid="toolbar-divider" className={TOOLBAR_DIVIDER_CLASS} />

          <Tooltip text={t('toolbar.addItem', 'Add Item')}>
            <button
              type="button"
              onClick={onToggleElementPalette}
              disabled={!isInteractive}
              data-testid="toolbar-add"
              className={addButtonClass}
              aria-label={t('toolbar.addItem', 'Add Item')}
              aria-expanded={shouldShowPalette}
              aria-haspopup="menu"
            >
              <Plus data-testid="toolbar-add-icon" className={addIconClass} aria-hidden="true" />
            </button>
          </Tooltip>

          <Tooltip text={t('toolbar.autoLayout')}>
            <Button
              onClick={onLayout}
              disabled={!isInteractive}
              data-testid="toolbar-layout"
              variant="ghost"
              size="icon"
              className={getToolbarIconButtonClass({ disabled: !isInteractive })}
              icon={
                <Workflow
                  className={`${TOOLBAR_ICON_CLASS} ${!isInteractive ? TOOLBAR_ICON_DISABLED_CLASS : ''}`}
                />
              }
            />
          </Tooltip>

          <div data-testid="toolbar-divider" className={TOOLBAR_DIVIDER_CLASS} />

          <ToolbarHistoryControls
            isInteractive={isInteractive}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={onUndo}
            onRedo={onRedo}
          />
        </div>

        {shouldShowPalette ? (
          <div className={TOOLBAR_PALETTE_OFFSET_CLASS}>
            <ElementPalette
              addItemActions={{ onAddShape, onAddAnnotation, onAddSection }}
              getCenter={getCenter}
              onOpenAssets={onOpenAssets}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
