import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useVisualSettingsActions } from '@/store/viewHooks';
import {
  SettingsCard,
  SettingsFieldTitle,
  SettingsSection,
  SettingsSegmentedControl,
  SettingsSelectTrigger,
} from './settingsPrimitives';

const LANGUAGES = [
  { code: 'en', nativeName: 'English' },
  { code: 'zh', nativeName: '中文（简体）' },
  { code: 'ja', nativeName: '日本語' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'fr', nativeName: 'Français' },
  { code: 'es', nativeName: 'Español' },
  { code: 'tr', nativeName: 'Türkçe' },
] as const;

export function HomeSettingsGeneralPanel(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { setViewSettings } = useVisualSettingsActions();
  const [langOpen, setLangOpen] = useState(false);

  const currentLanguage =
    LANGUAGES.find((entry) => entry.code === i18n.language) ??
    LANGUAGES.find((entry) => i18n.language.startsWith(entry.code)) ??
    LANGUAGES[0];

  async function changeLanguage(code: string): Promise<void> {
    await i18n.changeLanguage(code);
    setViewSettings({ language: code });
    setLangOpen(false);
  }

  return (
    <SettingsCard>
      <SettingsSection>
        <SettingsFieldTitle>{t('settings.appearance', 'Appearance')}</SettingsFieldTitle>
        <SettingsSegmentedControl
          value={theme}
          onChange={setTheme}
          options={[
            { value: 'light', label: t('settings.themeLight', 'Light') },
            { value: 'dark', label: t('settings.themeDark', 'Dark') },
            { value: 'system', label: t('settings.themeSystem', 'System') },
          ]}
        />
      </SettingsSection>

      <SettingsSection bordered>
        <SettingsFieldTitle>{t('settings.language', 'Language')}</SettingsFieldTitle>
        <div className="relative w-[240px]">
          <SettingsSelectTrigger
            label={currentLanguage.nativeName}
            open={langOpen}
            onClick={() => setLangOpen((open) => !open)}
          />
          {langOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40"
                aria-label={t('common.close', 'Close')}
                onClick={() => setLangOpen(false)}
              />
              <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-[#D8DCE2] bg-white p-1 shadow-md dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)]">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => void changeLanguage(lang.code)}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-[13px] ${
                      currentLanguage.code === lang.code
                        ? 'bg-[color-mix(in_srgb,var(--brand-primary)_9%,white)] font-medium text-[var(--brand-primary)]'
                        : 'text-[var(--brand-text)] hover:bg-[#F3F5F8] dark:hover:bg-[var(--brand-background)]'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    {currentLanguage.code === lang.code ? <Check className="h-3.5 w-3.5" /> : null}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </SettingsSection>
    </SettingsCard>
  );
}
