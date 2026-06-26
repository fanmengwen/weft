import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROUTE_LOADING_I18N_KEYS } from './routeLoadingCopy';

interface RouteLoadingFallbackProps {
  title?: string;
  description?: string;
}

export function RouteLoadingFallback({
  title,
  description,
}: RouteLoadingFallbackProps): React.ReactElement {
  const { t } = useTranslation();

  const resolvedTitle = title ?? t(ROUTE_LOADING_I18N_KEYS.title);
  const resolvedDescription = description ?? t(ROUTE_LOADING_I18N_KEYS.description);

  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen flex items-center justify-center bg-[var(--brand-background)] px-6 text-[var(--brand-text)]"
    >
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-primary)]" />
        <h1 className="mt-4 text-lg font-semibold tracking-tight text-[var(--brand-text)]">{resolvedTitle}</h1>
        <p className="mt-2 text-sm text-[var(--brand-secondary)]">{resolvedDescription}</p>
      </div>
    </div>
  );
}
