import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SettingsCard,
  SettingsFieldHint,
  SettingsFieldTitle,
  SettingsGhostButton,
  SettingsSection,
} from './settingsPrimitives';

const APP_VERSION = '0.1.1';

export function HomeSettingsAboutPanel(): React.ReactElement {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);

  return (
    <SettingsCard>
      <SettingsSection className="flex items-center justify-between gap-4">
        <div>
          <SettingsFieldTitle>{t('homeSettings.about.version', 'Version')}</SettingsFieldTitle>
          <SettingsFieldHint>
            {checked
              ? t('homeSettings.about.upToDate', 'Weft V{{version}} · You are up to date', {
                  version: APP_VERSION,
                })
              : t('homeSettings.about.versionValue', 'Weft V{{version}}', {
                  version: APP_VERSION,
                })}
          </SettingsFieldHint>
        </div>
        <SettingsGhostButton onClick={() => setChecked(true)}>
          {t('homeSettings.about.checkUpdates', 'Check for updates')}
        </SettingsGhostButton>
      </SettingsSection>

      <SettingsSection bordered>
        <SettingsFieldTitle>
          {t('homeSettings.about.designSpecs', 'Design guidelines')}
        </SettingsFieldTitle>
        <div className="mt-2 flex gap-3.5">
          <span className="text-[12.5px] font-medium text-[var(--brand-primary)]">
            {t('homeSettings.about.elementStyles', 'Element styles')}
          </span>
          <span className="text-[12.5px] font-medium text-[var(--brand-primary)]">
            {t('homeSettings.about.toolbarSpecs', 'Toolbar specs')}
          </span>
        </div>
      </SettingsSection>
    </SettingsCard>
  );
}
