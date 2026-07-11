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
  selectedEdgeId: string | null;
  setMode: (mode: AppMode) => void;
  setWorkflowNodes: (nodes: FlowNode[]) => void;
  setWorkflowEdges: (edges: FlowEdge[]) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setSelectedEdgeId: (edgeId: string | null) => void;
  addWorkflowNode: (node: FlowNode) => void;
  updateWorkflowNodeData: (nodeId: string, patch: Partial<WorkflowNodeData>) => void;
  deleteWorkflowNode: (nodeId: string) => void;
  deleteWorkflowEdge: (edgeId: string) => void;
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
      selectedEdgeId: null,
      setMode: (mode) => set({ mode }),
      setWorkflowNodes: (workflowNodes) => set({ workflowNodes }),
      setWorkflowEdges: (workflowEdges) => set({ workflowEdges }),
      // Node and edge selection are mutually exclusive — the properties
      // panel shows one or the other.
      setSelectedNodeId: (selectedNodeId) =>
        set(selectedNodeId === null ? { selectedNodeId } : { selectedNodeId, selectedEdgeId: null }),
      setSelectedEdgeId: (selectedEdgeId) =>
        set(selectedEdgeId === null ? { selectedEdgeId } : { selectedEdgeId, selectedNodeId: null }),
      addWorkflowNode: (node) =>
        set((state) => ({
          workflowNodes: [
            ...state.workflowNodes.map((existing) => ({ ...existing, selected: false })),
            node,
          ],
          selectedNodeId: node.id,
          selectedEdgeId: null,
        })),
      updateWorkflowNodeData: (nodeId, patch) =>
        set((state) => ({
          workflowNodes: state.workflowNodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...(node.data as unknown as WorkflowNodeData), ...patch } as NodeData }
              : node
          ),
        })),
      deleteWorkflowNode: (nodeId) =>
        set((state) => {
          const workflowEdges = state.workflowEdges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          );
          return {
            workflowNodes: state.workflowNodes.filter((node) => node.id !== nodeId),
            workflowEdges,
            selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
            selectedEdgeId: workflowEdges.some((edge) => edge.id === state.selectedEdgeId)
              ? state.selectedEdgeId
              : null,
          };
        }),
      deleteWorkflowEdge: (edgeId) =>
        set((state) => ({
          workflowEdges: state.workflowEdges.filter((edge) => edge.id !== edgeId),
          selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
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
        set((state) => {
          const workflowEdges = applyFlowEdgeChanges(changes, state.workflowEdges) as FlowEdge[];
          return {
            workflowEdges,
            selectedEdgeId: workflowEdges.some((edge) => edge.id === state.selectedEdgeId)
              ? state.selectedEdgeId
              : null,
          };
        }),
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
      // Runtime-only props (selection) stay out of storage; run state lives
      // in the separate, unpersisted run store.
      partialize: (
        state
      ): Pick<WorkflowState, 'mode' | 'workflowNodes' | 'workflowEdges'> => ({
        mode: state.mode,
        workflowNodes: state.workflowNodes.map((node) => ({ ...node, selected: false })),
        workflowEdges: state.workflowEdges.map((edge) => ({ ...edge, selected: false })),
      }),
    }
  )
);
