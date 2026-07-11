import { beforeEach, describe, expect, it } from 'vitest';
import type { FlowNode } from '@/lib/types';
import { useFlowStore } from '@/store';
import { createWorkflowNode } from '../dnd/createWorkflowNode';
import { useWorkflowStore } from './workflowStore';

describe('useWorkflowStore', () => {
  beforeEach(() => {
    useWorkflowStore.setState({
      mode: 'chart',
      workflowNodes: [],
      workflowEdges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
    });
  });

  it('defaults to chart mode and toggles to workflow', () => {
    expect(useWorkflowStore.getState().mode).toBe('chart');
    useWorkflowStore.getState().setMode('workflow');
    expect(useWorkflowStore.getState().mode).toBe('workflow');
  });

  it('leaves the chart store untouched when switching mode', () => {
    const chartNodesBefore = useFlowStore.getState().nodes;
    const chartDocsBefore = useFlowStore.getState().documents;
    useWorkflowStore.getState().setMode('workflow');
    expect(useFlowStore.getState().nodes).toBe(chartNodesBefore);
    expect(useFlowStore.getState().documents).toBe(chartDocsBefore);
  });

  it('writes only its own buffer, never the chart canvas', () => {
    const node: FlowNode = { id: 'w1', position: { x: 0, y: 0 }, data: { label: 'test' } };
    useWorkflowStore.getState().setWorkflowNodes([node]);
    expect(useWorkflowStore.getState().workflowNodes).toHaveLength(1);
    expect(useFlowStore.getState().nodes).toEqual([]);
  });

  it('connects nodes in the workflow buffer only', () => {
    const a = createWorkflowNode('textInput', { x: 0, y: 0 });
    const b = createWorkflowNode('llm', { x: 200, y: 0 });
    useWorkflowStore.getState().setWorkflowNodes([a, b]);
    const ok = useWorkflowStore.getState().onWorkflowConnect({
      source: a.id,
      target: b.id,
      sourceHandle: 'out',
      targetHandle: 'in',
    });
    expect(ok).toBe(true);
    expect(useWorkflowStore.getState().workflowEdges).toHaveLength(1);
    expect(useFlowStore.getState().edges).toEqual([]);
  });

  it('persists graph content with runtime selection stripped', () => {
    const node = { ...createWorkflowNode('textInput', { x: 0, y: 0 }), selected: true };
    const options = useWorkflowStore.persist.getOptions();
    const partial = options.partialize!({
      ...useWorkflowStore.getState(),
      mode: 'workflow',
      workflowNodes: [node],
      workflowEdges: [
        { id: 'e1', source: 'a', target: 'b', selected: true },
      ] as unknown as ReturnType<typeof useWorkflowStore.getState>['workflowEdges'],
    }) as {
      mode: string;
      workflowNodes: FlowNode[];
      workflowEdges: { selected?: boolean }[];
    };

    expect(partial.mode).toBe('workflow');
    expect(partial.workflowNodes).toHaveLength(1);
    expect(partial.workflowNodes[0].selected).toBe(false);
    expect(partial.workflowEdges[0].selected).toBe(false);
    expect('selectedNodeId' in partial).toBe(false);
    expect('selectedEdgeId' in partial).toBe(false);
  });

  it('keeps node and edge selection mutually exclusive', () => {
    const a = createWorkflowNode('textInput', { x: 0, y: 0 });
    const b = createWorkflowNode('llm', { x: 200, y: 0 });
    useWorkflowStore.getState().setWorkflowNodes([a, b]);
    useWorkflowStore.getState().onWorkflowConnect({
      source: a.id,
      target: b.id,
      sourceHandle: 'out',
      targetHandle: 'in',
    });
    const edgeId = useWorkflowStore.getState().workflowEdges[0].id;

    useWorkflowStore.getState().setSelectedNodeId(a.id);
    useWorkflowStore.getState().setSelectedEdgeId(edgeId);
    expect(useWorkflowStore.getState().selectedNodeId).toBeNull();
    expect(useWorkflowStore.getState().selectedEdgeId).toBe(edgeId);

    useWorkflowStore.getState().setSelectedNodeId(b.id);
    expect(useWorkflowStore.getState().selectedEdgeId).toBeNull();
    expect(useWorkflowStore.getState().selectedNodeId).toBe(b.id);
  });

  it('deletes an edge and clears its selection', () => {
    const a = createWorkflowNode('textInput', { x: 0, y: 0 });
    const b = createWorkflowNode('llm', { x: 200, y: 0 });
    useWorkflowStore.getState().setWorkflowNodes([a, b]);
    useWorkflowStore.getState().onWorkflowConnect({
      source: a.id,
      target: b.id,
      sourceHandle: 'out',
      targetHandle: 'in',
    });
    const edgeId = useWorkflowStore.getState().workflowEdges[0].id;
    useWorkflowStore.getState().setSelectedEdgeId(edgeId);

    useWorkflowStore.getState().deleteWorkflowEdge(edgeId);

    expect(useWorkflowStore.getState().workflowEdges).toHaveLength(0);
    expect(useWorkflowStore.getState().selectedEdgeId).toBeNull();
  });

  it('clears edge selection when deleting an endpoint node cascades', () => {
    const a = createWorkflowNode('textInput', { x: 0, y: 0 });
    const b = createWorkflowNode('llm', { x: 200, y: 0 });
    useWorkflowStore.getState().setWorkflowNodes([a, b]);
    useWorkflowStore.getState().onWorkflowConnect({
      source: a.id,
      target: b.id,
      sourceHandle: 'out',
      targetHandle: 'in',
    });
    useWorkflowStore.getState().setSelectedEdgeId(useWorkflowStore.getState().workflowEdges[0].id);

    useWorkflowStore.getState().deleteWorkflowNode(a.id);

    expect(useWorkflowStore.getState().workflowEdges).toHaveLength(0);
    expect(useWorkflowStore.getState().selectedEdgeId).toBeNull();
  });

  it('deletes a node, its edges, and clears selection', () => {
    const a = createWorkflowNode('textInput', { x: 0, y: 0 });
    const b = createWorkflowNode('llm', { x: 200, y: 0 });
    const c = createWorkflowNode('output', { x: 400, y: 0 });
    useWorkflowStore.getState().setWorkflowNodes([a, b, c]);
    useWorkflowStore.getState().onWorkflowConnect({
      source: a.id,
      target: b.id,
      sourceHandle: 'out',
      targetHandle: 'in',
    });
    useWorkflowStore.getState().onWorkflowConnect({
      source: b.id,
      target: c.id,
      sourceHandle: 'out',
      targetHandle: 'in',
    });
    useWorkflowStore.getState().setSelectedNodeId(b.id);

    useWorkflowStore.getState().deleteWorkflowNode(b.id);

    expect(useWorkflowStore.getState().workflowNodes).toHaveLength(2);
    expect(useWorkflowStore.getState().workflowNodes.map((n) => n.id)).toEqual([a.id, c.id]);
    expect(useWorkflowStore.getState().workflowEdges).toHaveLength(0);
    expect(useWorkflowStore.getState().selectedNodeId).toBeNull();
    expect(useFlowStore.getState().nodes).toEqual([]);
  });
});
