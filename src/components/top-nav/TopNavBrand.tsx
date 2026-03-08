import React from 'react';
import { useTranslation } from 'react-i18next';
import { OpenFlowLogo } from '../icons/OpenFlowLogo';
import { ShieldAlert } from 'lucide-react';
import { Tooltip } from '../Tooltip';

interface BrandUIConfig {
    showBeta?: boolean;
}

interface TopNavBrandProps {
    appName: string;
    logoUrl: string | null;
    logoStyle: 'icon' | 'text' | 'both' | 'wide';
    ui: BrandUIConfig;
}

export function TopNavBrand({ appName, logoUrl, logoStyle, ui }: TopNavBrandProps): React.ReactElement {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-2">
            {(logoStyle === 'icon' || logoStyle === 'both') && (
                <div className="w-9 h-9 flex items-center justify-center bg-[var(--brand-primary-50)] rounded-[var(--radius-md)] text-[var(--brand-primary)] overflow-hidden relative shrink-0">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                        <OpenFlowLogo className="w-6 h-6" />
                    )}
                </div>
            )}

            {logoStyle === 'wide' && (
                <div className="h-8 flex-1 flex items-center justify-start text-[var(--brand-primary)] shrink-0 px-1 max-w-[180px] overflow-hidden">
                    {logoUrl ? (
                        <div className="flex items-center justify-start h-full">
                            <img
                                src={logoUrl}
                                alt="Logo"
                                className="h-[70%] w-auto max-w-full object-contain object-left"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--brand-primary-50)] rounded-[var(--radius-md)] border border-[var(--brand-primary-100)] opacity-80 hover:opacity-100 transition-opacity cursor-help" title={t('nav.uploadWideLogo', 'Upload a wide logo in Brand Settings to see it here')}>
                            <OpenFlowLogo className="w-4 h-4" />
                            <span className="text-xs font-semibold whitespace-nowrap">{t('nav.wideLogo', 'Your Wide Logo')}</span>
                        </div>
                    )}
                </div>
            )}

            {(logoStyle === 'text' || logoStyle === 'both') && (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 tracking-tight text-lg leading-none">{appName}</span>
                </div>
            )}

            {(ui.showBeta ?? true) && (
                <Tooltip text={t('nav.privacyMessage', 'All your diagrams stay in your local storage and none of it is saved in our servers.')} side="bottom">
                    <div className="flex items-center justify-center text-[var(--brand-primary)] animate-in fade-in zoom-in-50 duration-300">
                        <ShieldAlert className="w-[18px] h-[18px] drop-shadow-sm text-white" fill="var(--brand-primary)" />
                    </div>
                </Tooltip>
            )}
        </div>
    );
}
