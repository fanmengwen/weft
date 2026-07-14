import React from 'react';
import { useReactFlow, useViewport } from '@/lib/reactflowCompat';
import { Plus, Minus, Maximize, HelpCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { useTranslation } from 'react-i18next';
import { useShortcutHelpActions } from '@/store/viewHooks';

const NAV_CONTROL_INTERACTIVE_CLASS =
  'text-[var(--brand-secondary)] transition-colors hover:bg-[#F3F5F8]';

const NAV_RAIL_BUTTON_CLASS = `flex h-8 w-full items-center justify-center ${NAV_CONTROL_INTERACTIVE_CLASS}`;

const NAV_RAIL_CLASS =
  'flex w-9 flex-col rounded-[10px] border border-[#E6E8EC] bg-[#FFFFFF] shadow-[0_2px_8px_rgba(16,24,40,0.08)]';

const NAV_HELP_BUTTON_CLASS = `flex h-9 w-9 items-center justify-center rounded-full border border-[#E6E8EC] bg-[#FFFFFF] shadow-[0_2px_8px_rgba(16,24,40,0.08)] ${NAV_CONTROL_INTERACTIVE_CLASS}`;

export function NavigationControls(): React.ReactElement {
  const { t } = useTranslation();
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const { setShortcutsHelpOpen } = useShortcutHelpActions();

  return (
    <div className="absolute bottom-4 right-4 z-50 flex flex-col items-center gap-2">
      <div className={NAV_RAIL_CLASS}>
        <Tooltip text={t('navigationControls.zoomIn')} side="left">
          <button
            onClick={() => zoomIn({ duration: 300 })}
            className={`${NAV_RAIL_BUTTON_CLASS} rounded-t-[10px]`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </Tooltip>
        <div className="flex h-[26px] select-none items-center justify-center text-center text-[10.5px] tabular-nums text-[var(--brand-secondary)]">
          {Math.round(zoom * 100)}%
        </div>
        <Tooltip text={t('navigationControls.zoomOut')} side="left">
          <button onClick={() => zoomOut({ duration: 300 })} className={NAV_RAIL_BUTTON_CLASS}>
            <Minus className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip text={t('navigationControls.fitView')} side="left">
          <button
            onClick={() => fitView({ duration: 600, padding: 0.2 })}
            className={`${NAV_RAIL_BUTTON_CLASS} rounded-b-[10px]`}
          >
            <Maximize className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
      <Tooltip text={t('navigationControls.keyboardShortcuts')} side="left">
        <button onClick={() => setShortcutsHelpOpen(true)} className={NAV_HELP_BUTTON_CLASS}>
          <HelpCircle className="h-4 w-4" />
        </button>
      </Tooltip>
    </div>
  );
}
