import React from 'react';
import { useTranslation } from 'react-i18next';

interface StudioLauncherProps {
  onOpen: () => void;
}

function SparklesIcon(): React.ReactElement {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" aria-hidden className="block">
      <path
        d="M12 4 L13.5 9 L18.5 10.5 L13.5 12 L12 17 L10.5 12 L5.5 10.5 L10.5 9 Z"
        fill="currentColor"
      />
      <path
        d="M18 15.5 L18.8 17.7 L21 18.5 L18.8 19.3 L18 21.5 L17.2 19.3 L15 18.5 L17.2 17.7 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function StudioLauncher({ onOpen }: StudioLauncherProps): React.ReactElement {
  const { t } = useTranslation();
  const label = t('settings.aiAssistant', 'AI assistant');
  const openLabel = t('commandBar.commands.openAIAssistant', 'Open AI assistant');

  return (
    <button
      type="button"
      onClick={onOpen}
      data-testid="studio-launcher"
      title={openLabel}
      aria-label={openLabel}
      className="absolute right-0 top-1/2 z-40 flex -translate-y-1/2 cursor-pointer flex-col items-center gap-2 rounded-l-xl bg-[linear-gradient(180deg,var(--wf-acc)_0%,color-mix(in_srgb,var(--wf-acc)_78%,#1A2B66)_100%)] px-[9px] pb-[13px] pt-[15px] text-white shadow-[-3px_4px_14px_rgba(16,24,40,0.22)] transition-[filter] hover:brightness-105"
    >
      <SparklesIcon />
      <span className="text-[12.5px] font-semibold tracking-[0.18em] [writing-mode:vertical-rl]">
        {label}
      </span>
    </button>
  );
}
