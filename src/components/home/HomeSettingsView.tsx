import React from 'react';
import { useTranslation } from 'react-i18next';
import { HomeSettingsAboutPanel } from './settings/HomeSettingsAboutPanel';
import { HomeSettingsAIPanel } from './settings/HomeSettingsAIPanel';
import { HomeSettingsCanvasPanel } from './settings/HomeSettingsCanvasPanel';
import { HomeSettingsGeneralPanel } from './settings/HomeSettingsGeneralPanel';
import { HomeSettingsShortcutsPanel } from './settings/HomeSettingsShortcutsPanel';
import { HOME_SETTINGS_TABS, type HomeSettingsTab } from './settings/homeSettingsTabs';
import { SettingsNavItem } from './settings/settingsPrimitives';

export type { HomeSettingsTab };

interface HomeSettingsViewProps {
  activeSettingsTab: HomeSettingsTab;
  onSettingsTabChange: (tab: HomeSettingsTab) => void;
}

export function HomeSettingsView({
  activeSettingsTab,
  onSettingsTabChange,
}: HomeSettingsViewProps): React.ReactElement {
  const { t } = useTranslation();

  const tabLabels: Record<HomeSettingsTab, string> = {
    general: t('settings.general', 'General'),
    canvas: t('settings.canvas', 'Canvas'),
    ai: t('settings.ai', 'AI'),
    shortcuts: t('settings.shortcuts', 'Shortcuts'),
    about: t('settings.about', 'About'),
  };

  function renderPanel(): React.ReactElement {
    switch (activeSettingsTab) {
      case 'general':
        return <HomeSettingsGeneralPanel />;
      case 'canvas':
        return <HomeSettingsCanvasPanel />;
      case 'ai':
        return <HomeSettingsAIPanel />;
      case 'shortcuts':
        return <HomeSettingsShortcutsPanel />;
      case 'about':
        return <HomeSettingsAboutPanel />;
    }
  }

  return (
    <div
      className="flex-1 overflow-y-auto animate-in fade-in duration-300"
      data-testid="home-settings-view"
    >
      <div className="mx-auto max-w-[880px] px-4 py-8 sm:px-8 md:px-10 md:py-9 md:pb-14">
        <h1 className="m-0 text-[21px] font-bold tracking-tight text-[var(--brand-text)]">
          {t('settings.title', 'Settings')}
        </h1>
        <p className="mt-1.5 text-[13px] text-[#6B7484] dark:text-[var(--brand-secondary)]">
          {t(
            'homeSettings.subtitle',
            'App preferences, plus default canvas and AI behavior.'
          )}
        </p>

        <div className="mt-6 grid grid-cols-1 items-start gap-5 md:grid-cols-[176px_1fr]">
          <nav
            className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible"
            aria-label={t('settings.title', 'Settings')}
            data-testid="home-settings-nav"
          >
            {HOME_SETTINGS_TABS.map((tab) => (
              <SettingsNavItem
                key={tab}
                label={tabLabels[tab]}
                active={activeSettingsTab === tab}
                onClick={() => onSettingsTabChange(tab)}
              />
            ))}
          </nav>

          <div className="min-w-0" data-testid={`home-settings-panel-${activeSettingsTab}`}>
            {renderPanel()}
          </div>
        </div>
      </div>
    </div>
  );
}
