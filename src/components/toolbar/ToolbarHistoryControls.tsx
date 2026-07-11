import React from 'react';
import { Redo2, Undo2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Tooltip } from '../Tooltip';
import {
  TOOLBAR_ICON_CLASS,
  TOOLBAR_ICON_DISABLED_CLASS,
  getToolbarIconButtonClass,
} from './toolbarButtonStyles';

interface ToolbarHistoryControlsProps {
  isInteractive: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function ToolbarHistoryControls({
  isInteractive,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: ToolbarHistoryControlsProps): React.ReactElement {
  const { t } = useTranslation();
  const undoDisabled = !canUndo || !isInteractive;
  const redoDisabled = !canRedo || !isInteractive;

  return (
    <>
      <Tooltip text={t('toolbar.undo')}>
        <Button
          onClick={onUndo}
          disabled={undoDisabled}
          data-testid="toolbar-undo"
          variant="ghost"
          size="icon"
          className={getToolbarIconButtonClass({ disabled: undoDisabled })}
          icon={
            <Undo2
              className={`${TOOLBAR_ICON_CLASS} ${undoDisabled ? TOOLBAR_ICON_DISABLED_CLASS : ''}`}
            />
          }
        />
      </Tooltip>
      <Tooltip text={t('toolbar.redo')}>
        <Button
          onClick={onRedo}
          disabled={redoDisabled}
          data-testid="toolbar-redo"
          variant="ghost"
          size="icon"
          className={getToolbarIconButtonClass({ disabled: redoDisabled })}
          icon={
            <Redo2
              className={`${TOOLBAR_ICON_CLASS} ${redoDisabled ? TOOLBAR_ICON_DISABLED_CLASS : ''}`}
            />
          }
        />
      </Tooltip>
    </>
  );
}