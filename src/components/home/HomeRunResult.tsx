import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';
import { normalizeRunMarkdown } from './homeRunPresentation';

interface HomeRunResultProps {
  record: WorkflowRunRecord;
}

export function HomeRunResult({ record }: HomeRunResultProps): React.ReactElement {
  const { t } = useTranslation();
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const failed = record.status === 'failed' || record.status === 'aborted';
  const error = record.logEntries.findLast((entry) => entry.level === 'error');
  const content = record.finalOutput || error?.raw || (error?.messageKey ? t(error.messageKey, error.messageParams) : '');
  const renderedContent = normalizeRunMarkdown(content);
  function copyResult(): void {
    void navigator.clipboard.writeText(content).then(
      () => setCopied(true),
      () => setCopied(false)
    );
  }
  return (
    <section className="mt-[22px]">
      <h3 className="mb-2 text-xs font-semibold text-[var(--brand-secondary)]">{t('homeRuns.result')}</h3>
      <div className={`overflow-hidden rounded-[var(--brand-radius)] border bg-[var(--brand-surface)] ${failed ? 'border-[var(--color-surface-danger-border)]' : 'border-[var(--brand-border)]'}`}>
        {failed ? (
          <div className="bg-[var(--color-surface-danger-bg)] px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[var(--color-surface-danger-text)]">{t('homeRuns.runFailed')}</p>
            <p className="mt-1.5 whitespace-pre-wrap text-[12.5px] leading-6 text-[var(--brand-secondary)]">{content || t('homeRuns.noResult')}</p>
          </div>
        ) : (
          <div className="px-[18px] py-[15px] text-[13px] leading-7 text-[var(--brand-text)]">
            {showRaw ? <pre className="whitespace-pre-wrap break-words font-mono text-xs">{content}</pre> : renderedContent ? <MarkdownRenderer content={renderedContent} enableBreaks /> : <p className="text-[var(--brand-secondary)]">{t('homeRuns.noResult')}</p>}
          </div>
        )}
        {content ? (
          <div className="flex items-center gap-2 border-t border-[var(--brand-border)] px-[18px] py-2.5 text-[11px] text-[var(--brand-secondary)]">
            <span>{showRaw ? t('homeRuns.rawResult') : t('homeRuns.markdownRendered')}</span>
            <span className="flex-1" />
            <button type="button" onClick={() => setShowRaw((current) => !current)} className="text-xs font-medium text-[var(--brand-primary)]">{showRaw ? t('homeRuns.renderedResult') : t('homeRuns.viewRaw')}</button>
            <span className="h-3 w-px bg-[var(--brand-border)]" />
            <button type="button" onClick={copyResult} className="text-xs font-medium text-[var(--brand-primary)]">{copied ? t('homeRuns.copied') : t('homeRuns.copy')}</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
