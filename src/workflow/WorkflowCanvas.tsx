import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type EdgeMouseHandler,
  type NodeMouseHandler,
} from '@/lib/reactflowCompat';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/ToastContext';
import { createWorkflowNode } from './dnd/createWorkflowNode';
import { useWorkflowDnD } from './dnd/useWorkflowDnD';
import { isValidWorkflowConnection } from './graph/workflowConnectionRules';
import { WorkflowEdge } from './graph/WorkflowEdge';
import { WORKFLOW_EDGE_STYLE } from './graph/workflowEdgeStyle';
import { workflowNodeTypes } from './nodes/workflowNodeTypes';
import { WorkflowLogPanel } from './panels/WorkflowLogPanel';
import { useWorkflowStore } from './store/workflowStore';
import { WorkflowEmptyCanvas } from './WorkflowEmptyCanvas';

const workflowEdgeTypes = { workflow: WorkflowEdge };

function WorkflowCanvasInner(): React.ReactElement {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { draggingKind, cancelDrag } = useWorkflowDnD();

  const workflowNodes = useWorkflowStore((state) => state.workflowNodes);
  const workflowEdges = useWorkflowStore((state) => state.workflowEdges);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const selectedEdgeId = useWorkflowStore((state) => state.selectedEdgeId);
  const onWorkflowNodesChange = useWorkflowStore((state) => state.onWorkflowNodesChange);
  const onWorkflowEdgesChange = useWorkflowStore((state) => state.onWorkflowEdgesChange);
  const onWorkflowConnect = useWorkflowStore((state) => state.onWorkflowConnect);
  const addWorkflowNode = useWorkflowStore((state) => state.addWorkflowNode);
  const setSelectedNodeId = useWorkflowStore((state) => state.setSelectedNodeId);
  const setSelectedEdgeId = useWorkflowStore((state) => state.setSelectedEdgeId);

  const nodes = useMemo(
    () =>
      workflowNodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      })),
    [selectedNodeId, workflowNodes]
  );

  // Normalize every edge to the workflow edge type at render time, so edges
  // from older persisted graphs and imported files shed their baked-in style;
  // the WorkflowEdge component owns the look, including selection.
  const edges = useMemo(
    () =>
      workflowEdges.map((edge) => ({
        ...edge,
        type: 'workflow' as const,
        animated: false,
        style: undefined,
        markerEnd: undefined,
        selected: edge.id === selectedEdgeId,
      })),
    [selectedEdgeId, workflowEdges]
  );

  // Center the persisted graph but keep the default 100% zoom; the zoom
  // controls then step in flat 20% increments from there.
  useEffect(() => {
    fitView({ padding: 0.2, minZoom: 1, maxZoom: 1, duration: 0 });
  }, [fitView]);

  useEffect(() => {
    if (!draggingKind) {
      return;
    }

    const onPointerUp = (event: PointerEvent) => {
      const pane = wrapperRef.current?.querySelector('.react-flow__pane');
      if (pane instanceof HTMLElement) {
        const rect = pane.getBoundingClientRect();
        const overPane =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (overPane) {
          const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
          addWorkflowNode(createWorkflowNode(draggingKind, position));
        }
      }
      cancelDrag();
    };

    window.addEventListener('pointerup', onPointerUp);
    return () => window.removeEventListener('pointerup', onPointerUp);
  }, [addWorkflowNode, cancelDrag, draggingKind, screenToFlowPosition]);

  const handleConnect = useCallback(
    (connection: Connection) => {
      const accepted = onWorkflowConnect(connection);
      if (!accepted) {
        addToast(t('workflowMode.connect.invalid'), 'warning');
      }
    },
    [addToast, onWorkflowConnect, t]
  );

  const isValidConnection = useCallback(
    (connection: Connection) =>
      isValidWorkflowConnection(connection, workflowNodes, workflowEdges),
    [workflowEdges, workflowNodes]
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      setSelectedEdgeId(edge.id);
    },
    [setSelectedEdgeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [setSelectedEdgeId, setSelectedNodeId]);

  return (
    <div ref={wrapperRef} className="relative min-h-0 flex-1 bg-[var(--wf-bg)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={workflowNodeTypes}
        edgeTypes={workflowEdgeTypes}
        onNodesChange={onWorkflowNodesChange}
        onEdgesChange={onWorkflowEdgesChange}
        onConnect={handleConnect}
        isValidConnection={isValidConnection}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        connectionLineStyle={WORKFLOW_EDGE_STYLE}
        minZoom={0.2}
        autoPanOnNodeDrag={false}
        autoPanOnConnect={false}
        proOptions={{ hideAttribution: true }}
        className="workflow-flow h-full w-full"
      >
        <Background gap={22} size={1} color="#dee1e7" />
      </ReactFlow>
      {nodes.length === 0 ? (
        <WorkflowEmptyCanvas
          nodes={nodes}
          edges={edges}
          onTemplateApplied={() => window.setTimeout(() => fitView({ padding: 0.2 }), 0)}
        />
      ) : null}
    </div>
  );
}

// Own provider so the workflow canvas keeps a React Flow store separate from
// the chart editor's; with a shared one, whichever canvas mounts next briefly
// renders the other mode's nodes against the wrong nodeTypes registry.
// The bottom status bar lives inside the provider because its zoom controls
// read the viewport through useReactFlow.
export function WorkflowCanvas(): React.ReactElement {
  return (
    <ReactFlowProvider>
      <div className="flex h-full min-h-0 min-w-0 flex-col">
        <WorkflowCanvasInner />
        <WorkflowLogPanel />
      </div>
    </ReactFlowProvider>
  );
}
