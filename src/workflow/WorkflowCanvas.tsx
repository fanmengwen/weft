import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  useReactFlow,
  type Connection,
  type NodeMouseHandler,
} from '@/lib/reactflowCompat';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/ToastContext';
import { createWorkflowNode } from './dnd/createWorkflowNode';
import { useWorkflowDnD } from './dnd/useWorkflowDnD';
import { isValidWorkflowConnection } from './graph/workflowConnectionRules';
import { workflowNodeTypes } from './nodes/workflowNodeTypes';
import { useWorkflowStore } from './store/workflowStore';

function WorkflowCanvasInner(): React.ReactElement {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const { draggingKind, cancelDrag } = useWorkflowDnD();

  const workflowNodes = useWorkflowStore((state) => state.workflowNodes);
  const workflowEdges = useWorkflowStore((state) => state.workflowEdges);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const onWorkflowNodesChange = useWorkflowStore((state) => state.onWorkflowNodesChange);
  const onWorkflowEdgesChange = useWorkflowStore((state) => state.onWorkflowEdgesChange);
  const onWorkflowConnect = useWorkflowStore((state) => state.onWorkflowConnect);
  const addWorkflowNode = useWorkflowStore((state) => state.addWorkflowNode);
  const setSelectedNodeId = useWorkflowStore((state) => state.setSelectedNodeId);

  const nodes = useMemo(
    () =>
      workflowNodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      })),
    [selectedNodeId, workflowNodes]
  );

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

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div ref={wrapperRef} className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={workflowEdges}
        nodeTypes={workflowNodeTypes}
        onNodesChange={onWorkflowNodesChange}
        onEdgesChange={onWorkflowEdgesChange}
        onConnect={handleConnect}
        isValidConnection={isValidConnection}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        proOptions={{ hideAttribution: true }}
        className="h-full w-full"
      >
        <Background gap={16} size={1} color="rgba(59, 130, 246, 0.1)" />
      </ReactFlow>
      {nodes.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-base font-semibold text-[var(--brand-text)]">
            {t('workflowMode.canvas.emptyTitle')}
          </p>
          <p className="text-sm text-[var(--brand-secondary)]">
            {t('workflowMode.canvas.emptyHint')}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function WorkflowCanvas(): React.ReactElement {
  return <WorkflowCanvasInner />;
}
