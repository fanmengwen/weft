import { createId } from '@/lib/id';
import { getNodeParentId, setNodeParent } from '@/lib/nodeParent';
import type { FlowNode, NodeData } from '@/lib/types';
import { createDefaultEdge } from '@/constants';
import { useFlowStore } from '@/store';
import { assignSmartHandlesWithOptions, getSmartRoutingOptionsFromViewSettings } from '@/services/smartEdgeRouting';

function createSiblingData(sourceNode: FlowNode): NodeData {
  return {
    label: 'New Node',
    subLabel: typeof sourceNode.data?.subLabel === 'string' ? sourceNode.data.subLabel : '',
    color: sourceNode.data?.color as string | undefined,
    shape: sourceNode.data?.shape as NodeData['shape'],
    icon: sourceNode.data?.icon as string | undefined,
    layerId: sourceNode.data?.layerId as string | undefined,
  };
}

export function createConnectedSibling(sourceNodeId: string): string | null {
  const state = useFlowStore.getState();
  const sourceNode = state.nodes.find((node) => node.id === sourceNodeId);
  if (!sourceNode) {
    return null;
  }

  const siblingId = createId(sourceNode.type ?? 'node');
  const siblingX = sourceNode.position.x + 260;
  const siblingY = sourceNode.position.y;
  const sourceParentId = getNodeParentId(sourceNode);

  let siblingNode: FlowNode = {
    id: siblingId,
    type: sourceNode.type,
    position: { x: siblingX, y: siblingY },
    data: createSiblingData(sourceNode),
    selected: true,
  };

  if (sourceParentId) {
    siblingNode = setNodeParent(siblingNode, sourceParentId);
  }

  const insertedEdge = createDefaultEdge(sourceNodeId, siblingId);

  state.recordHistoryV2();
  state.setNodes((nodes) => [
    ...nodes.map((node) => ({ ...node, selected: false })),
    siblingNode,
  ]);
  state.setEdges((edges) => {
    const insertedEdges = edges.concat(insertedEdge);
    if (!state.viewSettings.smartRoutingEnabled) {
      return insertedEdges;
    }
    return assignSmartHandlesWithOptions(
      useFlowStore.getState().nodes.concat(siblingNode),
      insertedEdges,
      getSmartRoutingOptionsFromViewSettings(state.viewSettings)
    );
  });
  state.setSelectedNodeId(siblingId);

  return siblingId;
}
