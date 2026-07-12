import React, { useCallback, useState } from 'react';
import { Node } from '@/lib/reactflowCompat';
import { NodeData } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { NamedIcon } from '../IconMap';
import {
  chartNodeToneVars,
  getNodeDefaults,
  resolveChartNodeChipIcon,
  resolveNodeTone,
  type NodeShape,
} from '../nodeHelpers';
import {
  getAddItemDefinitionById,
  type AddItemId,
} from '../add-items/addItemRegistry';

interface NodePropertiesHeaderProps {
  selectedNode: Node<NodeData>;
  onChange: (id: string, data: Partial<NodeData>) => void;
}

function resolveAddItemIdFromNode(
  nodeType: string,
  shape: NodeShape | undefined
): AddItemId | null {
  if (nodeType === 'start') return 'start';
  if (nodeType === 'end') return 'end';
  if (nodeType === 'process') return 'process';
  if (nodeType === 'decision') return 'decision';
  if (nodeType === 'annotation') return 'annotation';
  if (nodeType === 'custom' && shape === 'parallelogram') return 'io';
  if (nodeType === 'custom' && shape === 'cylinder') return 'database';
  return null;
}

function resolveHeaderChipIcon(
  nodeType: string,
  shape: NodeShape,
  dataIcon: string | null
): string {
  if (nodeType === 'annotation') return 'Pencil';
  return resolveChartNodeChipIcon(nodeType, shape, dataIcon);
}

function HeaderToneChip({
  toneVars,
  chipIcon,
}: {
  toneVars: { background: string; color: string };
  chipIcon: string;
}): React.ReactElement {
  return (
    <div
      className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px]"
      style={{ background: toneVars.background, color: toneVars.color }}
    >
      <NamedIcon name={chipIcon} fallbackName="Square" className="h-4 w-4" />
    </div>
  );
}

function HeaderEditableName({
  label,
  onCommit,
}: {
  label: string;
  onCommit: (value: string) => void;
}): React.ReactElement {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(label);

  const beginEdit = useCallback(() => {
    setDraft(label);
    setIsEditing(true);
  }, [label]);

  const commit = useCallback(() => {
    onCommit(draft);
    setIsEditing(false);
  }, [draft, onCommit]);

  const cancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  if (isEditing) {
    return (
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            cancel();
          }
        }}
        onBlur={commit}
        autoFocus
        className="w-full border-0 bg-transparent p-0 text-[15px] font-semibold leading-[1.25] text-[var(--wf-text)] outline-none focus:ring-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={beginEdit}
      className="w-full truncate text-left text-[15px] font-semibold leading-[1.25] text-[var(--wf-text)]"
    >
      {label || '\u00a0'}
    </button>
  );
}

export function NodePropertiesHeader({
  selectedNode,
  onChange,
}: NodePropertiesHeaderProps): React.ReactElement {
  const { t } = useTranslation();
  const nodeType = selectedNode.type || 'process';
  const defaults = getNodeDefaults(nodeType);
  const shape = (selectedNode.data?.shape || defaults.shape) as NodeShape;
  const dataIcon =
    selectedNode.data?.icon === 'none' ? null : selectedNode.data?.icon || defaults.icon;
  const toneVars = chartNodeToneVars(resolveNodeTone(selectedNode));
  const chipIcon = resolveHeaderChipIcon(nodeType, shape, dataIcon);
  const addItemId = resolveAddItemIdFromNode(nodeType, shape);
  const typeLabel = addItemId ? getAddItemDefinitionById(addItemId, t).label : null;
  const label = selectedNode.data?.label || '';

  return (
    <div className="flex items-center gap-2.5 px-4 pt-3.5">
      <HeaderToneChip toneVars={toneVars} chipIcon={chipIcon} />
      <div className="min-w-0 flex-1">
        <HeaderEditableName
          label={label}
          onCommit={(value) => onChange(selectedNode.id, { label: value })}
        />
        {typeLabel ? (
          <div className="mt-[3px] flex items-center gap-[5px]">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: toneVars.color }}
            />
            <span className="text-[12px] text-[#6B7484]">{typeLabel}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
