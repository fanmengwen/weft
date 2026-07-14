import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '../Tooltip';

interface SaveStatusIndicatorProps {
  showPrivacyMessage?: boolean;
}

function getTooltipText(
  t: ReturnType<typeof useTranslation>['t'],
  time: string,
  showPrivacyMessage: boolean
): string {
  const messages = [
    t('nav.autoSaved', {
      defaultValue: 'Saved locally at {{time}}.',
      time,
    }),
  ];

  if (showPrivacyMessage) {
    messages.push(
      t('nav.privacyShort', {
        defaultValue: 'Your diagrams stay on this device and do not reach our servers.',
      })
    );
  }

  return messages.join('\n');
}

export function SaveStatusIndicator({
  showPrivacyMessage = true,
}: SaveStatusIndicatorProps): React.ReactElement {
  const { t } = useTranslation();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    function updateTime(): void {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }

    updateTime();

    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const tooltipText = getTooltipText(t, time, showPrivacyMessage);
  const ariaLabel = t('nav.saveStatus', {
    defaultValue: 'Local save status',
  });

  return (
    <Tooltip
      text={tooltipText}
      side="bottom"
      contentClassName="max-w-[260px] whitespace-pre-line text-center leading-snug sm:max-w-[320px]"
    >
      <div
        aria-label={ariaLabel}
        className="flex cursor-default items-center justify-center px-1"
      >
        <svg width={15} height={15} viewBox="0 0 24 24" aria-hidden className="block shrink-0">
          <circle cx={12} cy={12} r={10} fill="var(--wf-acc)" />
          <path
            d="M8 12.2 L10.8 15 L16 9.5"
            stroke="#fff"
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Tooltip>
  );
}
