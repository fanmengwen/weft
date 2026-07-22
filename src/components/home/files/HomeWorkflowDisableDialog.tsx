import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Pause, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getFlowDisplayName } from '@/lib/flowDisplayName';
import { Button } from '../../ui/Button';

interface HomeWorkflowDisableDialogProps {
  flowName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function HomeWorkflowDisableDialog({
  flowName,
  isOpen,
  onClose,
  onConfirm,
}: HomeWorkflowDisableDialogProps): React.ReactElement | null {
  const { t } = useTranslation();
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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-workflow-disable-title"
        aria-describedby="home-workflow-disable-description"
        className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-brand-border)] bg-[var(--brand-surface)] shadow-[var(--shadow-overlay)]"
      >
        <div className="flex items-start justify-between border-b border-[var(--color-brand-border)] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-primary-50)] text-[var(--brand-primary)]">
              <Pause className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="home-workflow-disable-title"
                className="text-base font-semibold text-[var(--brand-text)]"
              >
                {t('homeFiles.disableDialog.title', 'Disable workflow')}
              </h2>
              <p
                id="home-workflow-disable-description"
                className="text-sm text-[var(--brand-secondary)]"
              >
                {t(
                  'homeFiles.disableDialog.description',
                  "It won't run automatically until you re-enable it."
                )}
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
            {t('homeFiles.disableDialog.confirmation', 'Disable "{{name}}"?', {
              name: getFlowDisplayName(flowName, t),
            })}
          </p>
          <p className="mt-2 text-xs text-[var(--brand-secondary)]">
            {t('homeFiles.disableDialog.hint', 'You can re-enable it anytime from the ⋯ menu.')}
          </p>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="button" variant="primary" onClick={onConfirm}>
              {t('homeFiles.disableDialog.confirmAction', 'Disable')}
            </Button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label={t('homeFiles.disableDialog.closeDialog', 'Close disable workflow dialog')}
      />
    </div>,
    document.body
  );
}
