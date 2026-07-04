import React from 'react';
import { Handle, Position, type LegacyNodeProps } from '@/lib/reactflowCompat';
import type { NodeRunStatus } from '../engine/types';
import { useWorkflowRunStore } from '../store/workflowRunStore';
import type { WorkflowNodeData } from './workflowNodeData';
import { WORKFLOW_NODE_CATALOG } from './nodeCatalog';

const STATUS_BORDER: Record<NodeRunStatus, string> = {
  idle: 'border-[var(--brand-border)]',
  running: 'border-[var(--brand-primary)] shadow-md ring-2 ring-[var(--brand-primary)]/30',
  succeeded: 'border-emerald-500 ring-2 ring-emerald-500/20',
  failed: 'border-[var(--brand-danger,#ef4444)] ring-2 ring-[var(--brand-danger,#ef4444)]/20',
  skipped: 'border-dashed border-[var(--brand-border)] opacity-60',
};

const STATUS_DOT: Partial<Record<NodeRunStatus, string>> = {
  running: 'bg-[var(--brand-primary)] animate-pulse',
  succeeded: 'bg-emerald-500',
  failed: 'bg-[var(--brand-danger,#ef4444)]',
  skipped: 'bg-[var(--brand-secondary)]',
};

export function WorkflowNodeShell(props: LegacyNodeProps<WorkflowNodeData>): React.ReactElement {
  const { id, data, selected } = props;
  const meta = WORKFLOW_NODE_CATALOG.find((entry) => entry.kind === data.kind);
  const runState = useWorkflowRunStore((state) => state.nodeRunStates[id] ?? 'idle');

  const showTarget = data.kind !== 'textInput';
  const showSource = data.kind !== 'output';

  return (
    <div
      className={[
        'min-w-[160px] rounded-[var(--brand-radius)] border bg-[var(--brand-surface)] px-3 py-2 shadow-sm transition-shadow',
        STATUS_BORDER[runState],
        selected && runState === 'idle'
          ? 'border-[var(--brand-primary)] shadow-md ring-2 ring-[var(--brand-primary)]/20'
          : '',
      ].join(' ')}
    >
      {showTarget ? (
        <Handle
          id="in"
          type="target"
          position={Position.Left}
          className="workflow-handle !h-3 !w-3 !border-2 !border-white !bg-[var(--brand-primary)]"
        />
      ) : null}
      {showSource ? (
        <Handle
          id="out"
          type="source"
          position={Position.Right}
          className="workflow-handle !h-3 !w-3 !border-2 !border-white !bg-[var(--brand-primary)]"
        />
      ) : null}
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--brand-radius)] text-base"
          style={{ backgroundColor: `${meta?.accent ?? '#3b82f6'}1a` }}
        >
          {meta?.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-[var(--brand-text)]">{data.label}</div>
        </div>
        {STATUS_DOT[runState] ? (
          <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[runState]}`} />
        ) : null}
      </div>
    </div>
  );
}
