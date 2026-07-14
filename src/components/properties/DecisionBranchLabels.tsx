import React from 'react';
import type { Edge } from '@/lib/reactflowCompat';
import { useFlowStore } from '@/store';
import { buildEdgeLabelUpdates, getEditableEdgeLabel } from './edge/edgeLabelModel';
import { handlePropertyInputKeyDown } from './propertyInputBehavior';

interface DecisionBranchLabelsProps {
  nodeId: string;
  onChangeEdge?: (id: string, updates: Partial<Edge>) => void;
}

interface BranchLabelSlotProps {
  prefix: string;
  edge: Edge | undefined;
  onChangeEdge?: (id: string, updates: Partial<Edge>) => void;
}

function BranchLabelSlot({ prefix, edge, onChangeEdge }: BranchLabelSlotProps): React.ReactElement {
  const isDisabled = edge === undefined || onChangeEdge === undefined;

  return (
    <div
      className={`flex-1 h-[34px] rounded-[8px] border border-[#D8DCE2] bg-white px-[10px] flex items-center gap-[7px] text-[13px]${isDisabled ? ' opacity-60' : ''}`}
    >
      <span className="text-[11px] text-[#98A1AE]">{prefix}</span>
      <input
        className="flex-1 border-0 bg-transparent outline-none text-[13px]"
        value={edge ? getEditableEdgeLabel(edge) : ''}
        disabled={isDisabled}
        onChange={(event) => {
          if (edge && onChangeEdge) {
            onChangeEdge(edge.id, buildEdgeLabelUpdates(event.target.value));
          }
        }}
        onKeyDown={(event) => handlePropertyInputKeyDown(event, { blurOnModifiedEnter: true })}
      />
    </div>
  );
}

/**
 * Edits yes/no branch labels on a decision node's first two outgoing edges by array order.
 */
export function DecisionBranchLabels({
  nodeId,
  onChangeEdge,
}: DecisionBranchLabelsProps): React.ReactElement {
  const outEdges = useFlowStore((state) => state.edges).filter((edge) => edge.source === nodeId);
  const yesEdge = outEdges[0];
  const noEdge = outEdges[1];
  const showMissingEdgesHint = yesEdge === undefined && noEdge === undefined;

  return (
    <>
      <div className="text-[12px] font-medium text-[#5C6572] mt-[12px] mb-[6px]">分支标签</div>
      <div className="flex gap-2">
        <BranchLabelSlot prefix="是" edge={yesEdge} onChangeEdge={onChangeEdge} />
        <BranchLabelSlot prefix="否" edge={noEdge} onChangeEdge={onChangeEdge} />
      </div>
      {showMissingEdgesHint ? (
        <div className="text-[11px] text-[#98A1AE] mt-[6px]">连接出边后可编辑分支标签</div>
      ) : null}
    </>
  );
}
