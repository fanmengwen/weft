import React from 'react';
import { useTranslation } from 'react-i18next';
import { WeftLogo } from '../icons/WeftLogo';
import { Tooltip } from '../Tooltip';
import { SaveStatusIndicator } from './SaveStatusIndicator';

interface BrandUIConfig {
  showBeta?: boolean;
}

interface TopNavBrandProps {
  appName: string;
  logoUrl: string | null;
  logoStyle: 'icon' | 'text' | 'both' | 'wide';
  ui: BrandUIConfig;
}

function shouldShowIconLogo(logoStyle: TopNavBrandProps['logoStyle']): boolean {
  return logoStyle === 'icon' || logoStyle === 'both';
}

function shouldShowTextLogo(logoStyle: TopNavBrandProps['logoStyle']): boolean {
  return logoStyle === 'text' || logoStyle === 'both';
}

export function TopNavBrand({
  appName,
  logoUrl,
  logoStyle,
  ui,
}: TopNavBrandProps): React.ReactElement {
  const { t } = useTranslation();
  const showPrivacyBadge = ui.showBeta !== false;
  const showIconLogo = shouldShowIconLogo(logoStyle);
  const showTextLogo = shouldShowTextLogo(logoStyle);

  return (
    <div className="flex min-w-0 items-center gap-1.5 px-1">
      {showIconLogo && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
          ) : (
            <WeftLogo className="h-7 w-7" />
          )}
        </div>
      )}

      {logoStyle === 'wide' && (
        <div className="flex h-8 w-fit shrink-0 items-center justify-start overflow-hidden px-1 text-[var(--brand-primary)] sm:max-w-[200px]">
          {logoUrl ? (
            <div className="flex h-full items-center justify-start">
              <img
                src={logoUrl}
                alt="Logo"
                className="h-[70%] w-auto max-w-full object-contain object-left"
              />
            </div>
          ) : (
            <Tooltip
              text={t('nav.uploadWideLogo', 'Upload a wide logo in Brand Settings to see it here')}
              side="bottom"
            >
              <div className="flex cursor-default items-center gap-2 rounded-[var(--radius-md)] border border-[var(--brand-primary-100)] px-3 py-1.5 opacity-80 transition-opacity hover:opacity-100">
                <WeftLogo className="h-4 w-4" />
                <span className="whitespace-nowrap text-xs font-semibold">
                  {t('nav.wideLogo', 'Your Wide Logo')}
                </span>
              </div>
            </Tooltip>
          )}
        </div>
      )}

      {showTextLogo && (
        <span className="truncate text-[15px] font-semibold leading-none text-[var(--wf-text)]">
          {appName}
        </span>
      )}

      <SaveStatusIndicator showPrivacyMessage={showPrivacyBadge} />
    </div>
  );
}
