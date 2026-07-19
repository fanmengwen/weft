import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_MODELS, PROVIDER_MODELS, PROVIDERS } from '@/config/aiProviders';
import { useFlowStore, type AIProvider } from '@/store';
import { SettingsSelectMenu } from './settingsSelectMenu';
import {
  SettingsCard,
  SettingsFieldHint,
  SettingsFieldTitle,
  SettingsGhostButton,
  SettingsSection,
  SettingsSelectTrigger,
} from './settingsPrimitives';

export function HomeSettingsAIPanel(): React.ReactElement {
  const { t } = useTranslation();
  const { aiSettings, setAISettings } = useFlowStore();
  const [providerOpen, setProviderOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'ok' | 'empty'>('idle');

  const currentProvider = (aiSettings.provider ?? 'gemini') as AIProvider;
  const providerMeta = PROVIDERS.find((provider) => provider.id === currentProvider) ?? PROVIDERS[0];
  const models = useMemo(() => PROVIDER_MODELS[currentProvider] ?? [], [currentProvider]);
  const currentModel = aiSettings.model ?? DEFAULT_MODELS[currentProvider];

  const modelLabel = useMemo(() => {
    const match = models.find((model) => model.id === currentModel);
    if (!match) {
      return currentModel;
    }
    return t(`settingsModal.ai.models.${currentProvider}.${match.translateKey}.label`, match.id);
  }, [currentModel, currentProvider, models, t]);

  function selectProvider(provider: AIProvider): void {
    setAISettings({
      provider,
      model: DEFAULT_MODELS[provider],
    });
    setProviderOpen(false);
    setModelOpen(false);
    setTestStatus('idle');
  }

  function selectModel(modelId: string): void {
    setAISettings({ model: modelId });
    setModelOpen(false);
    setTestStatus('idle');
  }

  function handleTestConnection(): void {
    const key = (aiSettings.apiKey ?? '').trim();
    if (currentProvider !== 'ollama' && key.length === 0) {
      setTestStatus('empty');
      return;
    }
    setTestStatus('ok');
  }

  return (
    <SettingsCard>
      <SettingsSection>
        <SettingsFieldTitle>
          {t('homeSettings.ai.provider', 'Model provider')}
        </SettingsFieldTitle>
        <div className="relative w-[240px]">
          <SettingsSelectTrigger
            label={providerMeta.name}
            open={providerOpen}
            onClick={() => {
              setProviderOpen((open) => !open);
              setModelOpen(false);
            }}
          />
          {providerOpen ? (
            <SettingsSelectMenu
              items={PROVIDERS.map((provider) => ({
                id: provider.id,
                label: provider.name,
                active: provider.id === currentProvider,
              }))}
              onSelect={(id) => selectProvider(id as AIProvider)}
              onClose={() => setProviderOpen(false)}
            />
          ) : null}
        </div>
      </SettingsSection>

      <SettingsSection bordered>
        <SettingsFieldTitle>{t('homeSettings.ai.model', 'Default model')}</SettingsFieldTitle>
        <SettingsFieldHint>
          {t(
            'homeSettings.ai.modelHint',
            'Workflow nodes set to follow global AI settings use this model'
          )}
        </SettingsFieldHint>
        <div className="relative w-[240px]">
          <SettingsSelectTrigger
            label={modelLabel}
            open={modelOpen}
            onClick={() => {
              setModelOpen((open) => !open);
              setProviderOpen(false);
            }}
          />
          {modelOpen ? (
            <SettingsSelectMenu
              items={models.map((model) => ({
                id: model.id,
                label: t(
                  `settingsModal.ai.models.${currentProvider}.${model.translateKey}.label`,
                  model.id
                ),
                active: model.id === currentModel,
              }))}
              onSelect={selectModel}
              onClose={() => setModelOpen(false)}
            />
          ) : null}
        </div>
      </SettingsSection>

      <SettingsSection bordered>
        <SettingsFieldTitle>{t('settingsModal.ai.apiKey', 'API Key')}</SettingsFieldTitle>
        <SettingsFieldHint>
          {t('homeSettings.ai.keyHint', 'Stored on this device only — never uploaded')}
        </SettingsFieldHint>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <input
            type="password"
            value={aiSettings.apiKey ?? ''}
            onChange={(event) => {
              setAISettings({ apiKey: event.target.value });
              setTestStatus('idle');
            }}
            placeholder={providerMeta.keyPlaceholder}
            autoComplete="off"
            className="block h-[34px] max-w-[320px] flex-1 rounded-lg border border-[#D8DCE2] bg-white px-2.5 text-[13px] text-[var(--brand-text)] outline-none focus:border-[var(--brand-primary)] dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)]"
          />
          <SettingsGhostButton onClick={handleTestConnection}>
            {t('homeSettings.ai.testConnection', 'Test connection')}
          </SettingsGhostButton>
        </div>
        {testStatus === 'ok' ? (
          <p className="mt-2 text-xs text-[var(--brand-primary)]">
            {t('homeSettings.ai.testOk', 'Key saved locally. Ready to use.')}
          </p>
        ) : null}
        {testStatus === 'empty' ? (
          <p className="mt-2 text-xs text-red-500">
            {t('homeSettings.ai.testEmpty', 'Enter an API key first.')}
          </p>
        ) : null}
      </SettingsSection>
    </SettingsCard>
  );
}
