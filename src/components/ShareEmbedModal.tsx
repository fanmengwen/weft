import React, { useCallback, useState } from 'react';
import { Check, Code2, Copy, ExternalLink, FileCode2, Link, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MODAL_PANEL_CLASS, SECTION_CARD_CLASS } from '@/lib/designTokens';

interface ShareEmbedModalProps {
    viewerUrl: string;
    onClose: () => void;
}

function CopyRow({
    label,
    value,
    icon: Icon,
    copyLabel,
    copiedLabel,
}: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    copyLabel: string;
    copiedLabel: string;
}): React.ReactElement {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [value]);

    return (
        <div className={`${SECTION_CARD_CLASS} p-3`}>
            <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--brand-secondary-light)]">
                    <Icon className="h-3 w-3" />
                    {label}
                </div>
                <button
                    type="button"
                    onClick={() => void handleCopy()}
                    className="flex items-center gap-1 rounded-[var(--radius-xs)] px-2 py-0.5 text-[11px] font-medium text-[var(--brand-secondary)] transition-colors hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)]"
                    aria-label={copyLabel}
                >
                    {copied ? (
                        <><Check className="h-3 w-3 text-emerald-500" /><span className="text-emerald-600">{copiedLabel}</span></>
                    ) : (
                        <><Copy className="h-3 w-3" />{copyLabel}</>
                    )}
                </button>
            </div>
            <p className="select-all break-all font-mono text-[11px] leading-relaxed text-[var(--brand-secondary)]">{value}</p>
        </div>
    );
}

export function ShareEmbedModal({ viewerUrl, onClose }: ShareEmbedModalProps): React.ReactElement {
    const { t } = useTranslation();
    const viewer = new URL(viewerUrl);
    const cardViewerUrl = (() => {
        const next = new URL(viewer.toString());
        next.searchParams.set('size', 'card');
        return next.toString();
    })();
    const badgeViewerUrl = (() => {
        const next = new URL(viewer.toString());
        next.searchParams.set('size', 'badge');
        return next.toString();
    })();
    const markdownLink = `[Open interactive diagram on Weft](${viewerUrl})`;
    const readmeLink = `[View architecture diagram](${badgeViewerUrl})`;
    const iframeSnippet = `<iframe src="${cardViewerUrl}" width="720" height="420" style="border:0;border-radius:16px;overflow:hidden;" loading="lazy" title="Weft diagram"></iframe>`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-embed-title"
                aria-describedby="share-embed-description"
                className={`relative mx-4 w-full max-w-md text-[var(--brand-text)] animate-in fade-in zoom-in-95 duration-150 ${MODAL_PANEL_CLASS}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-[var(--color-brand-border)] px-5 py-4">
                    <div>
                        <h2 id="share-embed-title" className="text-sm font-semibold text-[var(--brand-text)]">{t('shareEmbed.title')}</h2>
                        <p id="share-embed-description" className="mt-0.5 text-[11px] text-[var(--brand-secondary-light)]">{t('shareEmbed.description')}</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-1 text-[var(--brand-secondary)] transition-colors hover:bg-[var(--brand-background)] hover:text-[var(--brand-text)]" aria-label={t('shareEmbed.closeAria')}>
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-3 p-5">
                    <CopyRow label={t('shareEmbed.viewerLink')} value={viewerUrl} icon={Link} copyLabel={t('shareEmbed.copy')} copiedLabel={t('shareEmbed.copied')} />
                    <CopyRow label={t('shareEmbed.markdownLink')} value={markdownLink} icon={Code2} copyLabel={t('shareEmbed.copy')} copiedLabel={t('shareEmbed.copied')} />
                    <CopyRow label={t('shareEmbed.readmeLink')} value={readmeLink} icon={Code2} copyLabel={t('shareEmbed.copy')} copiedLabel={t('shareEmbed.copied')} />
                    <CopyRow label={t('shareEmbed.embedIframe')} value={iframeSnippet} icon={FileCode2} copyLabel={t('shareEmbed.copy')} copiedLabel={t('shareEmbed.copied')} />

                    <a
                        href={cardViewerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-brand-border)] py-2 text-xs font-medium text-[var(--brand-secondary)] transition-colors hover:bg-[var(--brand-background)] hover:text-[var(--brand-primary)]"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t('shareEmbed.openCardViewer')}
                    </a>
                </div>

                <div className="border-t border-[var(--color-brand-border)] px-5 py-3">
                    <p className="text-[10px] leading-relaxed text-[var(--brand-secondary-light)]">
                        {t('shareEmbed.footer')}
                    </p>
                </div>
            </div>
        </div>
    );
}
