import React from 'react';
import { Hand, MousePointer2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Tooltip } from '../Tooltip';
import {
  TOOLBAR_ICON_CLASS,
  TOOLBAR_ICON_DISABLED_CLASS,
  getToolbarIconButtonClass,
} from './toolbarButtonStyles';

interface ToolbarModeControlsProps {
  isInteractive: boolean;
  isSelectMode: boolean;
  onToggleSelectMode: () => void;
  onTogglePanMode: () => void;
}

export function ToolbarModeControls({
  isInteractive,
  isSelectMode,
  onToggleSelectMode,
  onTogglePanMode,
}: ToolbarModeControlsProps): React.ReactElement {
  const { t } = useTranslation();
  const disabled = !isInteractive;
  const selectIconClass = [
    TOOLBAR_ICON_CLASS,
    disabled ? TOOLBAR_ICON_DISABLED_CLASS : isSelectMode ? 'text-[var(--wf-acc)]' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const panIconClass = [
    TOOLBAR_ICON_CLASS,
    disabled ? TOOLBAR_ICON_DISABLED_CLASS : !isSelectMode ? 'text-[var(--wf-acc)]' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <Tooltip text={t('toolbar.selectMode')}>
        <Button
          onClick={onToggleSelectMode}
          disabled={disabled}
          data-testid="toolbar-select"
          variant="ghost"
          size="icon"
          className={getToolbarIconButtonClass({ active: isSelectMode, disabled })}
          icon={<MousePointer2 className={selectIconClass} />}
        />
      </Tooltip>
      <Tooltip text={t('toolbar.panMode')}>
        <Button
          onClick={onTogglePanMode}
          disabled={disabled}
          data-testid="toolbar-pan"
          variant="ghost"
          size="icon"
          className={getToolbarIconButtonClass({ active: !isSelectMode, disabled })}
          icon={<Hand className={panIconClass} />}
        />
      </Tooltip>
    </>
  );
}