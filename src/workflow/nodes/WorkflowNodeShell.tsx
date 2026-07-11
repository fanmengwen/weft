import React from 'react';
import { useTranslation } from 'react-i18next';
import { Handle, Position, type LegacyNodeProps } from '@/lib/reactflowCompat';
import type { NodeRunStatus } from '../engine/types';
import { useWorkflowRunStore } from '../store/workflowRunStore';
import { useWorkflowStore } from '../store/workflowStore';
import type { WorkflowNodeData } from './workflowNodeData';
import { WORKFLOW_NODE_CATALOG, workflowToneStyle } from './nodeCatalog';
import { WorkflowNodeIcon } from './WorkflowNodeIcon';

const STATUS_CARD: Record<NodeRunStatus, string> = {
  idle: 'rounded-[10px] border border-[var(--wf-node-border)] shadow-[var(--wf-shadow-card)]',
  running: 'rounded-xl border border-[var(--wf-acc)] shadow-[var(--wf-shadow-node-selected)]',
  succeeded:
    'rounded-[10px] border border-[var(--wf-success)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--wf-success)_12%,transparent)]',
  failed:
    'rounded-[10px] border border-[var(--wf-danger)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--wf-danger)_12%,transparent)]',
  skipped: 'rounded-[10px] border border-dashed border-[var(--wf-node-border)] opacity-60',
};

const SELECTED_CARD =
  'rounded-xl border-[1.5px] border-[var(--wf-acc)] shadow-[var(--wf-shadow-node-selected)]';

const STATUS_DOT: Partial<Record<NodeRunStatus, string>> = {
  running: 'bg-[var(--wf-acc)] animate-pulse',
  succeeded: 'bg-[var(--wf-success)]',
  failed: 'bg-[var(--wf-danger)]',
  skipped: 'bg-[var(--wf-text-muted)]',
};

/* Handle centers align with the icon tile center: p-3 (12px) + 30px tile / 2. */
const HANDLE_TOP = 27;

function handleClass(connected: boolean, branch?: 'true' | 'false'): string {
  return [
    'workflow-handle',
    connected ? '' : 'wf-handle-open',
    branch === 'true' ? 'wf-handle-true' : '',
    branch === 'false' ? 'wf-handle-false' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function WorkflowNodeShell(props: LegacyNodeProps<WorkflowNodeData>): React.ReactElement {
  const { id, data, selected } = props;
  const { t } = useTranslation();
  const meta = WORKFLOW_NODE_CATALOG.find((entry) => entry.kind === data.kind);
  const runState = useWorkflowRunStore((state) => state.nodeRunStates[id] ?? 'idle');
  const workflowEdges = useWorkflowStore((state) => state.workflowEdges);

  const showTarget = data.kind !== 'textInput';
  const showSource = data.kind !== 'output' && data.kind !== 'ifElse';

  const inConnected = workflowEdges.some((edge) => edge.target === id);
  const sourceConnected = (handleId: string) =>
    workflowEdges.some(
      (edge) => edge.source === id && (edge.sourceHandle ?? 'out') === handleId
    );

  const cardClass = selected && runState === 'idle' ? SELECTED_CARD : STATUS_CARD[runState];

  return (
    <div className={`w-[236px] bg-white p-3 transition-shadow ${cardClass}`}>
      {showTarget ? (
        // A connected target handle disappears — the edge's arrowhead marks
        // the entry point instead (per design). visibility keeps the handle's
        // geometry so React Flow can still anchor the edge to it.
        <Handle
          id="in"
          type="target"
          position={Position.Left}
          style={{ top: HANDLE_TOP }}
          className={`${handleClass(inConnected)}${inConnected ? ' wf-handle-hidden' : ''}`}
        />
      ) : null}
      {showSource ? (
        <Handle
          id="out"
          type="source"
          position={Position.Right}
          style={{ top: HANDLE_TOP }}
          className={handleClass(sourceConnected('out'))}
        />
      ) : null}
      {data.kind === 'ifElse' ? (
        <>
          <Handle
            id="true"
            type="source"
            position={Position.Right}
            style={{ top: '30%' }}
            title="TRUE"
            className={handleClass(sourceConnected('true'), 'true')}
          />
          <Handle
            id="false"
            type="source"
            position={Position.Right}
            style={{ top: '70%' }}
            title="FALSE"
            className={handleClass(sourceConnected('false'), 'false')}
          />
        </>
      ) : null}
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg"
          style={meta ? workflowToneStyle(meta.tone) : undefined}
        >
          <WorkflowNodeIcon kind={data.kind} className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-semibold leading-tight text-[var(--wf-text)]">
            {data.label}
          </div>
          <div className="mt-0.5 truncate text-[11px] text-[var(--wf-text-muted)]">
            {t(`workflowMode.nodes.${data.kind}.name`)}
          </div>
        </div>
        {STATUS_DOT[runState] ? (
          <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[runState]}`} />
        ) : null}
      </div>
      {data.kind === 'llm' ? (
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[var(--wf-node-divider)] pt-[9px] text-[11.5px]">
          <span className="shrink-0 text-[var(--wf-text-muted)]">
            {t('workflowMode.properties.modelField')}
          </span>
          <span className="truncate font-medium text-[var(--wf-text-btn)]">
            {data.model?.trim() || t('workflowMode.properties.modelFollowGlobal')}
          </span>
        </div>
      ) : null}
    </div>
  );
}
