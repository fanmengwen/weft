import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Share2, X, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCopyInvite: () => void;
    roomId: string;
}

export function ShareModal({
    isOpen,
    onClose,
    onCopyInvite,
    roomId
}: ShareModalProps): React.JSX.Element | null {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const brandRadius = 'var(--brand-radius, 24px)';
    const primaryColor = 'var(--brand-primary, #6366f1)';
    const primary50Color = 'var(--brand-primary-50, #eef2ff)';

    if (!isOpen) return null;

    function handleCopy(): void {
        onCopyInvite();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="bg-white shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-200"
                style={{ borderRadius: brandRadius }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex flex-col items-center text-center mt-2 mb-6">
                        <div
                            className="w-12 h-12 flex items-center justify-center mb-4 ring-8"
                            style={{
                                background: primary50Color,
                                color: primaryColor,
                                borderRadius: `calc(${brandRadius} * 0.75)`,
                                '--tw-ring-color': primary50Color,
                            } as React.CSSProperties}
                        >
                            <Share2 className="w-6 h-6" />
                        </div>

                        <h2
                            className="text-xl font-bold text-slate-900 mb-1 tracking-tight"
                            style={{ fontFamily: 'var(--brand-font-family, inherit)' }}
                        >
                            {t('share.title', 'Share Design')}
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-[260px]">
                            {t('share.description', 'Invite collaborators to view and edit this flow with you in real-time.')}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                                {t('share.roomLink', 'Collaboration Link')}
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-600 font-mono truncate select-all">
                                    {roomId}
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleCopy}
                            className={`w-full py-2.5 text-sm font-semibold transition-all ${copied ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                                }`}
                            icon={copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            style={copied ? {} : {
                                background: primaryColor,
                                borderRadius: `calc(${brandRadius} * 0.6)`,
                            }}
                        >
                            {copied ? t('share.copied', 'Copied Link!') : t('share.copyLink', 'Copy Link')}
                        </Button>

                        <p className="text-center text-slate-400 text-xs mt-4">
                            {t('share.permissionsNote', 'Anyone with the link can join.')}<br />
                            <span className="opacity-70 italic text-[10px]">Permission controls coming soon.</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Backdrop click to close */}
            <button
                type="button"
                className="absolute inset-0 -z-10"
                onClick={onClose}
                aria-label="Close share dialog"
            />
        </div>,
        document.body
    );
}
