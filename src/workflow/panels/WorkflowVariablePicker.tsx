import React from 'react';
import { useTranslation } from 'react-i18next';
import { listUpstreamVariables } from '../graph/upstreamVariables';
import { useWorkflowStore } from '../store/workflowStore';

interface WorkflowVariablePickerProps {
  nodeId: string;
  onPick: (template: string) => void;
}

// Dropdown of every {{nodeId.key}} selector reachable upstream of the node.
// Selecting one hands the ready-to-insert template to the parent field.
export function WorkflowVariablePicker({
  nodeId,
  onPick,
}: WorkflowVariablePickerProps): React.ReactElement {
  const { t } = useTranslation();
  const workflowNodes = useWorkflowStore((state) => state.workflowNodes);
  const workflowEdges = useWorkflowStore((state) => state.workflowEdges);
  const options = listUpstreamVariables(nodeId, workflowNodes, workflowEdges);

  return (
    <select
      value=""
      disabled={options.length === 0}
      onChange={(event) => {
        if (event.target.value) {
          onPick(`{{${event.target.value}}}`);
        }
      }}
      aria-label={t('workflowMode.properties.insertVariable')}
      className="max-w-40 appearance-none truncate rounded-md bg-[var(--wf-chip-bg)] px-2 py-[3px] text-xs font-medium text-[var(--wf-acc)] outline-none transition-colors hover:bg-[var(--wf-chip-hover)] disabled:opacity-60"
    >
      <option value="">
        {options.length === 0
          ? t('workflowMode.properties.noUpstreamVariables')
          : `{ } ${t('workflowMode.properties.insertVariable')}`}
      </option>
      {options.map((option) => (
        <option key={option.selector} value={option.selector}>
          {option.nodeLabel} · {option.key}
        </option>
      ))}
    </select>
  );
}
