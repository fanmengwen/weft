import React, { useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WorkflowLogEntry } from '../store/workflowRunStore';
import { useWorkflowRunStore } from '../store/workflowRunStore';
import { WorkflowZoomControls } from './WorkflowZoomControls';

const LEVEL_CLASS: Record<WorkflowLogEntry['level'], string> = {
  info: 'text-[var(--wf-text-label)]',
  warn: 'text-amber-600',
  error: 'text-[var(--wf-danger)]',
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour12: false });
}

function LogLine({ entry }: { entry: WorkflowLogEntry }): React.ReactElement {
  const { t } = useTranslation();
  const message = entry.messageKey ? t(entry.messageKey, entry.messageParams) : (entry.raw ?? '');
  return (
    <div className="flex gap-2 py-0.5 text-xs leading-relaxed">
      <span className="shrink-0 tabular-nums text-[var(--wf-text-faint)]">
        {formatTime(entry.ts)}
      </span>
      {entry.nodeLabel ? (
        <span className="shrink-0 font-medium text-[var(--wf-text)]">[{entry.nodeLabel}]</span>
      ) : null}
      <span className={`min-w-0 whitespace-pre-wrap break-words ${LEVEL_CLASS[entry.level]}`}>
        {message}
      </span>
    </div>
  );
}

// Bottom status bar of the canvas column: log toggle on the left, zoom
// controls on the right. The expanded log list opens upward (rendered above
// the bar), keeping the bar anchored to the canvas bottom edge.
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
    <div className="shrink-0 border-t border-[var(--wf-border)] bg-[var(--wf-surface)]">
      {expanded && logEntries.length > 0 ? (
        <div
          ref={listRef}
          className="max-h-56 overflow-y-auto border-b border-[var(--wf-hairline)] px-4 py-2"
        >
          {logEntries.map((entry) => (
            <LogLine key={entry.id} entry={entry} />
          ))}
        </div>
      ) : null}
      <div className="flex h-[38px] items-center gap-2 pl-3.5 pr-2.5">
        <button
          type="button"
          onClick={toggleLogOpen}
          aria-expanded={expanded}
          className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--wf-text-mid)] transition-colors hover:text-[var(--wf-text)]"
        >
          <ChevronRight
            aria-hidden
            className={`h-3 w-3 text-[var(--wf-text-muted)] transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
          {t('workflowMode.log.title')}
        </button>
        {runStatus !== 'idle' ? (
          <span className="rounded-md bg-[var(--wf-hover)] px-2 py-0.5 text-[10px] font-semibold text-[var(--wf-text-label)]">
            {t(`workflowMode.status.${runStatus}`)}
          </span>
        ) : null}
        {logEntries.length === 0 ? (
          <span className="text-xs text-[var(--wf-text-faint)]">
            {t('workflowMode.log.empty')}
          </span>
        ) : (
          <button
            type="button"
            onClick={clearLog}
            className="text-xs text-[var(--wf-text-muted)] transition-colors hover:text-[var(--wf-text)]"
          >
            {t('workflowMode.log.clear')}
          </button>
        )}
        <div className="ml-auto">
          <WorkflowZoomControls />
        </div>
      </div>
    </div>
  );
}
