import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';
import { workflowNodeTone } from '@/workflow/nodes/nodeCatalog';
import { formatRunDuration, nodeDurationMs } from './homeRunPresentation';
import { HomeRunNodeSnapshot } from './HomeRunNodeSnapshot';
import { HomeRunNodeStatusIcon } from './HomeRunNodeStatusIcon';

interface HomeRunNodeRowProps {
  nodeId: string;
  record: WorkflowRunRecord;
  open: boolean;
  onToggle: () => void;
}

function eventText(record: WorkflowRunRecord, nodeId: string): string[] {
  return record.logEntries
    .filter((entry) => entry.nodeId === nodeId && entry.raw)
    .map((entry) => entry.raw ?? '')
    .filter(Boolean);
}

export function HomeRunNodeRow({ nodeId, record, open, onToggle }: HomeRunNodeRowProps): React.ReactElement {
  const { t } = useTranslation();
  const status = record.nodeRunStates[nodeId];
  const snapshot = record.nodeSnapshots?.[nodeId];
  const eventLabel = record.logEntries.find((entry) => entry.nodeId === nodeId)?.nodeLabel;
  const label = snapshot?.label ?? eventLabel ?? nodeId;
  const duration = nodeDurationMs(record, nodeId);
  const events = eventText(record, nodeId);
  const canExpand = Boolean(snapshot?.inputSnapshot || snapshot?.outputSnapshot || events.length);
  const tone = snapshot ? workflowNodeTone(snapshot.kind) : null;
  return (
    <div className="border-t border-[var(--brand-border)] first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        disabled={!canExpand}
        data-testid={`run-node-${nodeId}`}
        className={`flex w-full items-center gap-2.5 px-3.5 py-[11px] text-left ${canExpand ? 'hover:bg-[var(--brand-background)]' : 'cursor-default'} ${status === 'skipped' || status === 'idle' ? 'opacity-60' : ''}`}
      >
        <HomeRunNodeStatusIcon status={status} />
        <span className="min-w-0 truncate text-[13px] font-semibold text-[var(--brand-text)]">{label}</span>
        {snapshot ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[11.5px] text-[var(--brand-secondary)]">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: `var(--wf-t-${tone}-fg)` }}
            />
            {t(`workflowMode.nodes.${snapshot.kind}.name`)}
          </span>
        ) : null}
        <span className="flex-1" />
        <span className="shrink-0 text-xs tabular-nums text-[var(--brand-secondary)]">
          {duration === null ? t(`homeRuns.nodeStatus.${status}`) : formatRunDuration(duration)}
        </span>
        {canExpand ? <ChevronRight className={`h-3.5 w-3.5 shrink-0 text-[var(--brand-secondary)] transition-transform ${open ? 'rotate-90' : ''}`} /> : null}
      </button>
      {open && canExpand ? (
        <HomeRunNodeSnapshot
          input={snapshot?.inputSnapshot}
          output={snapshot?.outputSnapshot ?? events.at(-1)}
          status={status}
          events={events}
        />
      ) : null}
    </div>
  );
}
