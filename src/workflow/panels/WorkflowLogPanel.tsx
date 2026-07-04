import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { WorkflowLogEntry } from '../store/workflowRunStore';
import { useWorkflowRunStore } from '../store/workflowRunStore';

const LEVEL_CLASS: Record<WorkflowLogEntry['level'], string> = {
  info: 'text-[var(--brand-secondary)]',
  warn: 'text-amber-600',
  error: 'text-[var(--brand-danger,#ef4444)]',
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour12: false });
}

function LogLine({ entry }: { entry: WorkflowLogEntry }): React.ReactElement {
  const { t } = useTranslation();
  const message = entry.messageKey ? t(entry.messageKey, entry.messageParams) : (entry.raw ?? '');
  return (
    <div className="flex gap-2 py-0.5 text-xs leading-relaxed">
      <span className="shrink-0 tabular-nums text-[var(--brand-secondary)] opacity-60">
        {formatTime(entry.ts)}
      </span>
      {entry.nodeLabel ? (
        <span className="shrink-0 font-medium text-[var(--brand-text)]">[{entry.nodeLabel}]</span>
      ) : null}
      <span className={`min-w-0 whitespace-pre-wrap break-words ${LEVEL_CLASS[entry.level]}`}>
        {message}
      </span>
    </div>
  );
}

export function WorkflowLogPanel(): React.ReactElement {
  const { t } = useTranslation();
  const logEntries = useWorkflowRunStore((state) => state.logEntries);
  const runStatus = useWorkflowRunStore((state) => state.runStatus);
  const clearLog = useWorkflowRunStore((state) => state.clearLog);
  const expanded = useWorkflowRunStore((state) => state.isLogOpen);
  const toggleLogOpen = useWorkflowRunStore((state) => state.toggleLogOpen);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [logEntries]);

  return (
    <div className="shrink-0 border-t border-[var(--brand-border)] bg-[var(--brand-glass-bg)] backdrop-blur-[var(--brand-glass-blur)]">
      <div className="flex h-10 items-center gap-2 px-4">
        <button
          type="button"
          onClick={toggleLogOpen}
          aria-expanded={expanded}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--brand-secondary)] transition-colors hover:text-[var(--brand-text)]"
        >
          <span
            className={`inline-block transition-transform ${expanded ? 'rotate-90' : ''}`}
            aria-hidden
          >
            ▸
          </span>
          {t('workflowMode.log.title')}
        </button>
        {runStatus !== 'idle' ? (
          <span className="rounded-full bg-[var(--brand-surface)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-secondary)]">
            {t(`workflowMode.status.${runStatus}`)}
          </span>
        ) : null}
        {logEntries.length === 0 ? (
          <span className="text-xs text-[var(--brand-secondary)] opacity-70">
            {t('workflowMode.log.empty')}
          </span>
        ) : (
          <button
            type="button"
            onClick={clearLog}
            className="ml-auto text-xs text-[var(--brand-secondary)] transition-colors hover:text-[var(--brand-text)]"
          >
            {t('workflowMode.log.clear')}
          </button>
        )}
      </div>
      {expanded && logEntries.length > 0 ? (
        <div ref={listRef} className="max-h-56 overflow-y-auto border-t border-[var(--brand-border)]/60 px-4 py-2">
          {logEntries.map((entry) => (
            <LogLine key={entry.id} entry={entry} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
