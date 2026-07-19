import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Activity, ArrowRight, Layers, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { TemplateDiagramPreview } from '@/components/templates/TemplatePresentation';
import type { FlowTemplate } from '@/services/templates';

interface TemplatesPreviewDialogProps {
  template: FlowTemplate;
  onClose: () => void;
  onUseTemplate: () => void;
}

export function TemplatesPreviewDialog({
  template,
  onClose,
  onUseTemplate,
}: TemplatesPreviewDialogProps): React.ReactElement | null {
  const { t } = useTranslation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    function handleEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-preview-title"
        aria-describedby="template-preview-description"
        className="relative flex w-full max-w-[1080px] flex-col overflow-hidden rounded-[24px] border border-[var(--color-brand-border)] bg-[var(--brand-surface)] shadow-2xl md:flex-row animate-in zoom-in-95 duration-200"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-brand-border)] bg-[var(--brand-surface)]/80 text-[var(--brand-secondary)] shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] hover:shadow"
          aria-label={t('homeTemplates.closePreview', 'Close template preview')}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="z-10 flex w-full flex-col border-b border-[var(--color-brand-border)] bg-[var(--brand-surface)] md:w-[420px] md:shrink-0 md:border-b-0 md:border-r">
          <div className="no-scrollbar flex-1 overflow-y-auto px-8 py-8">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-md bg-[var(--brand-primary)]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--brand-primary)] ring-1 ring-inset ring-[var(--brand-primary)]/20">
                {template.category}
              </span>
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--brand-secondary)]">
                <Layers className="h-3.5 w-3.5" />
                {t('homeTemplates.nodes', '{{count}} nodes', { count: template.nodes.length })}
              </span>
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--brand-secondary)]">
                <Activity className="h-3.5 w-3.5" />
                {t('homeTemplates.edges', '{{count}} edges', { count: template.edges.length })}
              </span>
            </div>

            <h2
              id="template-preview-title"
              className="mb-4 text-3xl font-bold leading-[1.15] tracking-tight text-[var(--brand-text)]"
            >
              {template.name}
            </h2>
            <p
              id="template-preview-description"
              className="mb-8 text-[15px] leading-relaxed text-[var(--brand-secondary)]"
            >
              {template.description}
            </p>

            {template.replacementHints.length > 0 ? (
              <div className="mb-8 rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-b from-[var(--brand-primary)]/[0.03] to-transparent p-5">
                <div className="mb-4 text-[12px] font-bold uppercase tracking-widest text-[var(--brand-primary)]">
                  {t('homeTemplates.bestFirstEdits', 'Best First Edits')}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {template.replacementHints.slice(0, 5).map((hint) => (
                    <span
                      key={hint}
                      className="inline-flex items-center rounded-lg border border-[var(--color-brand-border)] bg-[var(--brand-surface)] px-3 py-1.5 text-xs font-medium text-[var(--brand-text)] shadow-sm"
                    >
                      {hint}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {template.useCase ? (
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                  {t('homeTemplates.perfectFor', 'Perfect For')}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--brand-secondary)]">
                  {template.useCase}
                </p>
              </div>
            ) : null}
          </div>

          <div className="border-t border-[var(--color-brand-border)] bg-[var(--brand-background)]/50 p-6 backdrop-blur-sm">
            <Button
              type="button"
              variant="primary"
              onClick={onUseTemplate}
              className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold shadow-md transition-transform active:scale-[0.98]"
            >
              {t('homeTemplates.useTemplate', 'Use Template')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative min-h-[400px] flex-1 bg-[var(--brand-background)] md:min-h-0">
          <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(var(--color-brand-border)_1px,transparent_1px)] opacity-20 [background-size:20px_20px]" />
          <TemplateDiagramPreview template={template} density="hero" />
        </div>
      </div>

      <button
        type="button"
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label={t('homeTemplates.closePreview', 'Close template preview')}
      />
    </div>,
    document.body
  );
}
