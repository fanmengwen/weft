import type { Connection, EdgeChange, NodeChange } from '@xyflow/react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createDefaultEdge } from '@/constants';
import {
  addFlowEdge,
  applyFlowEdgeChanges,
  applyFlowNodeChanges,
} from '@/lib/reactflowCompat';
import type { FlowEdge, FlowNode, NodeData } from '@/lib/types';
import { isValidWorkflowConnection } from '../graph/workflowConnectionRules';
import type { WorkflowNodeData } from '../nodes/workflowNodeData';

export type AppMode = 'chart' | 'workflow';

interface WorkflowState {
  mode: AppMode;
  workflowNodes: FlowNode[];
  workflowEdges: FlowEdge[];
  selectedNodeId: string | null;
  setMode: (mode: AppMode) => void;
  setWorkflowNodes: (nodes: FlowNode[]) => void;
  setWorkflowEdges: (edges: FlowEdge[]) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  addWorkflowNode: (node: FlowNode) => void;
  updateWorkflowNodeData: (nodeId: string, patch: Partial<WorkflowNodeData>) => void;
  onWorkflowNodesChange: (changes: NodeChange[]) => void;
  onWorkflowEdgesChange: (changes: EdgeChange[]) => void;
  onWorkflowConnect: (connection: Connection) => boolean;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      mode: 'chart',
      workflowNodes: [],
      workflowEdges: [],
      selectedNodeId: null,
      setMode: (mode) => set({ mode }),
      setWorkflowNodes: (workflowNodes) => set({ workflowNodes }),
      setWorkflowEdges: (workflowEdges) => set({ workflowEdges }),
      setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
      addWorkflowNode: (node) =>
        set((state) => ({
          workflowNodes: [
            ...state.workflowNodes.map((existing) => ({ ...existing, selected: false })),
            node,
          ],
          selectedNodeId: node.id,
        })),
      updateWorkflowNodeData: (nodeId, patch) =>
        set((state) => ({
          workflowNodes: state.workflowNodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...(node.data as unknown as WorkflowNodeData), ...patch } as NodeData }
              : node
          ),
        })),
      onWorkflowNodesChange: (changes) =>
        set((state) => {
          const removedIds = changes
            .filter((change) => change.type === 'remove')
            .map((change) => change.id);
          const nextNodes = applyFlowNodeChanges(changes, state.workflowNodes) as FlowNode[];
          const selectedRemoved = removedIds.includes(state.selectedNodeId ?? '');
          return {
            workflowNodes: nextNodes,
            selectedNodeId: selectedRemoved ? null : state.selectedNodeId,
          };
        }),
      onWorkflowEdgesChange: (changes) =>
        set((state) => ({
          workflowEdges: applyFlowEdgeChanges(changes, state.workflowEdges) as FlowEdge[],
        })),
      onWorkflowConnect: (connection) => {
        const state = get();
        if (!isValidWorkflowConnection(connection, state.workflowNodes, state.workflowEdges)) {
          return false;
        }
        const edge = createDefaultEdge(connection.source!, connection.target!);
        edge.sourceHandle = connection.sourceHandle ?? 'out';
        edge.targetHandle = connection.targetHandle ?? 'in';
        set({
          workflowEdges: addFlowEdge(edge, state.workflowEdges) as FlowEdge[],
        });
        return true;
      },
    }),
    {
      name: 'weft-workflow',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): Pick<WorkflowState, 'mode'> => ({ mode: state.mode }),
    }
  )
);
