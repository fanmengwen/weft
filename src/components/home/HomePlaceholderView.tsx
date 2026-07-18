import React from 'react';
import { useTranslation } from 'react-i18next';

interface HomePlaceholderViewProps {
  titleKey: string;
  titleFallback: string;
  descriptionKey: string;
  descriptionFallback: string;
  testId: string;
}

export function HomePlaceholderView({
  titleKey,
  titleFallback,
  descriptionKey,
  descriptionFallback,
  testId,
}: HomePlaceholderViewProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div
      className="flex-1 overflow-y-auto animate-in fade-in duration-300"
      data-testid={testId}
    >
      <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-8 md:px-10 md:pb-16">
        <h1 className="m-0 text-[21px] font-bold tracking-tight text-[var(--brand-text)]">
          {t(titleKey, titleFallback)}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[var(--brand-secondary)]">
          {t(descriptionKey, descriptionFallback)}
        </p>
      </div>
    </div>
  );
}
