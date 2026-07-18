import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isMacLikePlatform } from '@/constants';
import { SettingsCard } from './settingsPrimitives';

interface ShortcutRow {
  labelKey: string;
  labelFallback: string;
  keysMac: string;
  keysOther: string;
}

const SHORTCUT_ROWS: ShortcutRow[] = [
  {
    labelKey: 'homeSettings.shortcuts.commandCenter',
    labelFallback: 'Command center',
    keysMac: '⌘K',
    keysOther: 'Ctrl+K',
  },
  {
    labelKey: 'homeSettings.shortcuts.select',
    labelFallback: 'Select tool',
    keysMac: 'V',
    keysOther: 'V',
  },
  {
    labelKey: 'homeSettings.shortcuts.hand',
    labelFallback: 'Hand tool',
    keysMac: 'H · Space',
    keysOther: 'H · Space',
  },
  {
    labelKey: 'homeSettings.shortcuts.addElement',
    labelFallback: 'Add element',
    keysMac: 'N',
    keysOther: 'N',
  },
  {
    labelKey: 'homeSettings.shortcuts.autoLayout',
    labelFallback: 'Auto layout',
    keysMac: '⇧L',
    keysOther: 'Shift+L',
  },
  {
    labelKey: 'homeSettings.shortcuts.undo',
    labelFallback: 'Undo',
    keysMac: '⌘Z',
    keysOther: 'Ctrl+Z',
  },
  {
    labelKey: 'homeSettings.shortcuts.redo',
    labelFallback: 'Redo',
    keysMac: '⇧⌘Z',
    keysOther: 'Ctrl+Shift+Z',
  },
  {
    labelKey: 'homeSettings.shortcuts.runWorkflow',
    labelFallback: 'Run workflow',
    keysMac: '⌘↵',
    keysOther: 'Ctrl+Enter',
  },
];

export function HomeSettingsShortcutsPanel(): React.ReactElement {
  const { t } = useTranslation();
  const isMac = useMemo(
    () =>
      typeof navigator !== 'undefined' &&
      isMacLikePlatform(navigator.platform || navigator.userAgent),
    []
  );

  return (
    <SettingsCard>
      {SHORTCUT_ROWS.map((row, index) => (
        <div
          key={row.labelKey}
          className={`flex items-center justify-between py-[11px] ${
            index < SHORTCUT_ROWS.length - 1
              ? 'border-b border-[#F0F2F5] dark:border-[var(--color-brand-border)]'
              : ''
          }`}
        >
          <span className="text-[13px] text-[#3E4753] dark:text-[var(--brand-text)]">
            {t(row.labelKey, row.labelFallback)}
          </span>
          <kbd className="rounded-[5px] border border-[#E1E4EA] bg-[#F0F2F5] px-2 py-0.5 font-mono text-[11px] text-[#5C6572] dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-background)] dark:text-[var(--brand-secondary)]">
            {isMac ? row.keysMac : row.keysOther}
          </kbd>
        </div>
      ))}
      <div className="py-[11px] text-xs text-[#98A1AE] dark:text-[var(--brand-secondary)]">
        {t(
          'homeSettings.shortcuts.hint',
          'Shortcuts match the toolbar. Customization is not available yet.'
        )}
      </div>
    </SettingsCard>
  );
}
