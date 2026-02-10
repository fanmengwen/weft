import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';

import { FlowHistoryState } from '../types';

const MAX_HISTORY = 20;

export const useFlowHistory = (
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void
) => {
  const [past, setPast] = useState<FlowHistoryState[]>([]);
  const [future, setFuture] = useState<FlowHistoryState[]>([]);

  const recordHistory = useCallback(() => {
    setPast((old) => [...old.slice(-MAX_HISTORY), { nodes, edges }]);
    setFuture([]);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((old) => old.slice(0, -1));
    setFuture((old) => [{ nodes, edges }, ...old]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
  }, [past, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((old) => old.slice(1));
    setPast((old) => [...old, { nodes, edges }]);
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [future, nodes, edges, setNodes, setEdges]);

  return { past, future, setPast, setFuture, recordHistory, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
};
