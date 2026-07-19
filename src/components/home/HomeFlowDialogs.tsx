import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Pencil, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getFlowDisplayName } from '@/lib/flowDisplayName';
import { Button } from '../ui/Button';

interface HomeFlowRenameDialogProps {
    flowName: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (nextName: string) => void;
}

interface HomeFlowDeleteDialogProps {
    flowName: string;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    /** soft-delete into Trash (default) or permanent purge */
    mode?: 'trash' | 'purge';
}

export function HomeFlowRenameDialog({
    flowName,
    isOpen,
    onClose,
    onSubmit,
}: HomeFlowRenameDialogProps): React.ReactElement | null {
    const { t } = useTranslation();
    const [draftName, setDraftName] = useState(flowName);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        closeButtonRef.current?.focus();

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        onSubmit(draftName);
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="home-flow-rename-title"
                aria-describedby="home-flow-rename-description"
                className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-brand-border)] bg-[var(--brand-surface)] shadow-[var(--shadow-overlay)]"
            >
                <div className="flex items-start justify-between border-b border-[var(--color-brand-border)] px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-primary-50)] text-[var(--brand-primary)]">
                            <Pencil className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 id="home-flow-rename-title" className="text-base font-semibold text-[var(--brand-text)]">
                                {t('home.renameFlow.title', 'Rename flow')}
                            </h2>
                            <p id="home-flow-rename-description" className="text-sm text-[var(--brand-secondary)]">
                                {t('home.renameFlow.description', 'Update the name shown on your dashboard and in the editor.')}
                            </p>
                        </div>
                    </div>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-[var(--brand-secondary)] transition-colors hover:bg-[var(--brand-background)] hover:text-[var(--brand-text)]"
                        aria-label={t('common.close', 'Close')}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5">
                    <label htmlFor="home-flow-rename-input" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-secondary)]">
                        {t('home.renameFlow.label', 'Flow name')}
                    </label>
                    <input
                        id="home-flow-rename-input"
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        className="w-full rounded-[var(--radius-md)] border border-[var(--color-brand-border)] px-3 py-2.5 text-sm text-[var(--brand-text)] outline-none transition-colors placeholder:text-[var(--brand-secondary)] focus:border-[var(--brand-primary)]"
                        placeholder={t('home.renameFlow.placeholder', 'Enter a flow name')}
                        autoFocus
                    />
                    <p className="mt-2 text-xs text-[var(--brand-secondary)]">
                        {t('home.renameFlow.hint', 'Names are local to this browser profile unless you export or sync them elsewhere.')}
                    </p>

                    <div className="mt-6 flex items-center justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button type="submit" variant="primary">
                            {t('common.save', 'Save')}
                        </Button>
                    </div>
                </form>
            </div>

            <button
                type="button"
                className="absolute inset-0 -z-10"
                onClick={onClose}
                aria-label={t('home.renameFlow.closeDialog', 'Close rename flow dialog')}
            />
        </div>,
        document.body
    );
}

export function HomeFlowDeleteDialog({
    flowName,
    isOpen,
    onClose,
    onConfirm,
    mode = 'trash',
}: HomeFlowDeleteDialogProps): React.ReactElement | null {
    const { t } = useTranslation();
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const isPurge = mode === 'purge';

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        closeButtonRef.current?.focus();

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const title = isPurge
        ? t('home.purgeFlow.title', 'Delete permanently')
        : t('home.deleteFlow.title', 'Move to trash');
    const description = isPurge
        ? t('home.purgeFlow.description', 'This permanently removes the file from this device.')
        : t('home.deleteFlow.description', 'The file will be moved to Trash so you can restore it later.');
    const confirmation = isPurge
        ? t('home.purgeFlow.confirmation', 'Permanently delete "{{name}}"?', {
            name: getFlowDisplayName(flowName, t),
        })
        : t('home.deleteFlow.confirmation', 'Move "{{name}}" to Trash?', {
            name: getFlowDisplayName(flowName, t),
        });
    const hint = isPurge
        ? t('home.purgeFlow.hint', 'This cannot be undone.')
        : t('home.deleteFlow.hint', 'You can restore it from Trash anytime.');
    const confirmLabel = isPurge
        ? t('home.trash.purge', 'Delete permanently')
        : t('home.deleteFlow.confirmAction', 'Move to trash');
    const closeLabel = isPurge
        ? t('home.purgeFlow.closeDialog', 'Close permanent delete dialog')
        : t('home.deleteFlow.closeDialog', 'Close delete flow dialog');

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="home-flow-delete-title"
                aria-describedby="home-flow-delete-description"
                className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-brand-border)] bg-[var(--brand-surface)] shadow-[var(--shadow-overlay)]"
            >
                <div className="flex items-start justify-between border-b border-[var(--color-brand-border)] px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 id="home-flow-delete-title" className="text-base font-semibold text-[var(--brand-text)]">
                                {title}
                            </h2>
                            <p id="home-flow-delete-description" className="text-sm text-[var(--brand-secondary)]">
                                {description}
                            </p>
                        </div>
                    </div>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-[var(--brand-secondary)] transition-colors hover:bg-[var(--brand-background)] hover:text-[var(--brand-text)]"
                        aria-label={t('common.close', 'Close')}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-6 py-5">
                    <p className="text-sm leading-6 text-[var(--brand-text)]">
                        {confirmation}
                    </p>
                    <p className="mt-2 text-xs text-[var(--brand-secondary)]">
                        {hint}
                    </p>

                    <div className="mt-6 flex items-center justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button type="button" variant="danger" onClick={onConfirm}>
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            </div>

            <button
                type="button"
                className="absolute inset-0 -z-10"
                onClick={onClose}
                aria-label={closeLabel}
            />
        </div>,
        document.body
    );
}
