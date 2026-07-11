import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, WandSparkles, Workflow } from 'lucide-react';
import { Button } from './ui/Button';
import { Tooltip } from './Tooltip';
import { ToolbarAddMenu } from './toolbar/ToolbarAddMenu';
import { ToolbarHistoryControls } from './toolbar/ToolbarHistoryControls';
import { ToolbarModeControls } from './toolbar/ToolbarModeControls';
import { getToolbarIconButtonClass, TOOLBAR_DIVIDER_CLASS } from './toolbar/toolbarButtonStyles';
import { AssetsIcon } from './icons/AssetsIcon';
import {
  getDefaultToolbarAddItemId,
  type AddItemId,
} from '@/components/add-items/addItemRegistry';

interface ToolbarProps {
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
  onToggleSelectMode: () => void;
  isSelectMode: boolean;
  onTogglePanMode: () => void;
  onCommandBar: () => void;
  isCommandBarOpen: boolean;
  onToggleStudio: () => void;
  isStudioOpen: boolean;
  onOpenAssets: () => void;
  onAddShape: (
    shape: import('@/lib/types').NodeData['shape'],
    position: { x: number; y: number }
  ) => void;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onAddSection: (position: { x: number; y: number }) => void;
  onAddArchitectureNode: (position: { x: number; y: number }) => void;
  onAddWireframe: (variant: 'browser' | 'mobile', position: { x: number; y: number }) => void;
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
  onCommandBar,
  isCommandBarOpen,
  onToggleStudio,
  isStudioOpen,
  onOpenAssets,
  onAddShape,
  onAddAnnotation,
  onAddSection,
  onAddArchitectureNode,
  onAddWireframe,
  onLayout,
  getCenter,
}) => {
  const { t } = useTranslation();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [currentAddItemId, setCurrentAddItemId] = useState<AddItemId>(getDefaultToolbarAddItemId);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const flowPilotIconClass = `w-4 h-4 transition-transform ${isStudioOpen ? 'scale-110 text-[var(--brand-primary)]' : 'group-hover:scale-110'}`;
  const shouldShowAddMenu = showAddMenu && !isCommandBarOpen && !isStudioOpen;

  // Close add menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as globalThis.Node)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Interaction guard: If command bar is open, disable all toolbar interactions
  const isInteractive = !isCommandBarOpen;
  const containerClasses = [
    'flex items-center p-2 bg-[var(--brand-glass-bg)] backdrop-blur-xl shadow-[var(--shadow-floating)] rounded-[var(--radius-xl)] border border-[var(--brand-glass-border)] transition-all duration-300',
    !isInteractive ? 'pointer-events-none' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-40 ${containerClasses}`}>
      {/* Group 1: Tools */}
      <ToolbarModeControls
        isInteractive={isInteractive}
        isSelectMode={isSelectMode}
        onToggleSelectMode={onToggleSelectMode}
        onTogglePanMode={onTogglePanMode}
      />

      <div className={`mx-2 ${TOOLBAR_DIVIDER_CLASS}`} />

      {/* Group 2: Actions */}
      <div className="flex items-center gap-1">
        <div ref={addMenuRef}>
          <ToolbarAddMenu
            currentItemId={currentAddItemId}
            isInteractive={isInteractive}
            showAddMenu={shouldShowAddMenu}
            onToggleMenu={() => setShowAddMenu((previouslyShown) => !previouslyShown)}
            onCloseMenu={() => setShowAddMenu(false)}
            onCurrentItemChange={setCurrentAddItemId}
            onAddShape={onAddShape}
            onAddAnnotation={onAddAnnotation}
            onAddSection={onAddSection}
            onAddArchitectureNode={onAddArchitectureNode}
            onAddWireframe={onAddWireframe}
            getCenter={getCenter}
          />
        </div>

        <Tooltip text={t('toolbar.assets', 'Assets')}>
          <Button
            onClick={onOpenAssets}
            disabled={!isInteractive}
            variant="ghost"
            size="icon"
            className={getToolbarIconButtonClass()}
            icon={<AssetsIcon className="w-4 h-4 transition-transform group-hover:scale-110" />}
          />
        </Tooltip>

        <Tooltip text={t('toolbar.commandCenter', 'Open Command Center')}>
          <Button
            onClick={onCommandBar}
            disabled={!isInteractive}
            variant="primary"
            size="icon"
            className={`group rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] transition-all hover:scale-105 active:scale-95 ${isCommandBarOpen ? 'bg-[var(--brand-text)] hover:bg-[var(--brand-text)]' : 'bg-[image:var(--brand-primary-grad)] hover:brightness-105'}`}
            icon={
              <Plus
                className={`w-5 h-5 text-white transition-transform duration-200 ${isCommandBarOpen ? 'rotate-45' : 'group-hover:rotate-90'}`}
              />
            }
          />
        </Tooltip>

        <Tooltip text={t('toolbar.autoLayout')}>
          <Button
            onClick={onLayout}
            disabled={!isInteractive}
            variant="ghost"
            size="icon"
            className={getToolbarIconButtonClass()}
            icon={<Workflow className="w-4 h-4 transition-transform group-hover:scale-110" />}
          />
        </Tooltip>

        <Tooltip text={t('toolbar.flowpilot', 'AI Assistant (Cmd+K)')}>
          <Button
            onClick={onToggleStudio}
            disabled={!isInteractive}
            variant="ghost"
            size="icon"
            className={`${getToolbarIconButtonClass({ active: isStudioOpen })} group relative overflow-hidden`}
          >
            <WandSparkles className={flowPilotIconClass} />
          </Button>
        </Tooltip>
      </div>

      <div className={`mx-2 ${TOOLBAR_DIVIDER_CLASS}`} />

      {/* Group 3: History */}
      <ToolbarHistoryControls
        isInteractive={isInteractive}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
      />
    </div>
  );
};
