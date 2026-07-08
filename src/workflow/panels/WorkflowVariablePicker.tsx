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
      className="rounded-[var(--brand-radius)] border border-dashed border-[var(--brand-border)] bg-transparent px-2 py-1 text-xs text-[var(--brand-secondary)] outline-none focus:border-[var(--brand-primary)] disabled:opacity-60"
    >
      <option value="">
        {options.length === 0
          ? t('workflowMode.properties.noUpstreamVariables')
          : `+ ${t('workflowMode.properties.insertVariable')}`}
      </option>
      {options.map((option) => (
        <option key={option.selector} value={option.selector}>
          {option.nodeLabel} · {option.key}
        </option>
      ))}
    </select>
  );
}
