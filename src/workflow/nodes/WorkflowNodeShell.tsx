import React from 'react';
import { Handle, Position, type LegacyNodeProps } from '@/lib/reactflowCompat';
import type { WorkflowNodeData } from './workflowNodeData';
import { WORKFLOW_NODE_CATALOG } from './nodeCatalog';

export function WorkflowNodeShell(props: LegacyNodeProps<WorkflowNodeData>): React.ReactElement {
  const { data, selected } = props;
  const meta = WORKFLOW_NODE_CATALOG.find((entry) => entry.kind === data.kind);

  const showTarget = data.kind === 'llm' || data.kind === 'webSearch' || data.kind === 'output';
  const showSource = data.kind === 'textInput' || data.kind === 'llm' || data.kind === 'webSearch';

  return (
    <div
      className={[
        'min-w-[160px] rounded-[var(--brand-radius)] border bg-[var(--brand-surface)] px-3 py-2 shadow-sm transition-shadow',
        selected
          ? 'border-[var(--brand-primary)] shadow-md ring-2 ring-[var(--brand-primary)]/20'
          : 'border-[var(--brand-border)]',
      ].join(' ')}
    >
      {showTarget ? (
        <Handle
          id="in"
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !border-2 !border-white !bg-[var(--brand-primary)]"
        />
      ) : null}
      {showSource ? (
        <Handle
          id="out"
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !border-2 !border-white !bg-[var(--brand-primary)]"
        />
      ) : null}
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--brand-radius)] text-base"
          style={{ backgroundColor: `${meta?.accent ?? '#3b82f6'}1a` }}
        >
          {meta?.icon}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[var(--brand-text)]">{data.label}</div>
        </div>
      </div>
    </div>
  );
}
