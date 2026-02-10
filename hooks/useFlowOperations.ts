import { useCallback } from 'react';
import { Node, Edge, Connection, addEdge, MarkerType, OnSelectionChangeParams } from 'reactflow';
import { NodeData } from '../types';
import { EDGE_STYLE, EDGE_LABEL_STYLE, EDGE_LABEL_BG_STYLE } from '../constants';

export const useFlowOperations = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  recordHistory: () => void,
  setSelectedNodeId: (id: string | null) => void,
  setSelectedEdgeId: (id: string | null) => void
) => {
  // --- Node Data Updates ---
  const updateNodeData = useCallback((id: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => node.id === id ? { ...node, data: { ...node.data, ...data } } : node)
    );
  }, [setNodes]);

  const updateNodeType = useCallback((id: string, type: string) => {
    recordHistory();
    setNodes((nds) => nds.map((node) => node.id === id ? { ...node, type } : node));
  }, [setNodes, recordHistory]);

  // --- Edge Updates ---
  const updateEdge = useCallback((id: string, updates: Partial<Edge>) => {
    recordHistory();
    setEdges((eds) => eds.map((edge) => edge.id === id ? { ...edge, ...updates } : edge));
  }, [setEdges, recordHistory]);

  // --- Delete Operations ---
  const deleteNode = useCallback((id: string) => {
    recordHistory();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setSelectedNodeId(null);
  }, [setNodes, recordHistory, setSelectedNodeId]);

  const deleteEdge = useCallback((id: string) => {
    recordHistory();
    setEdges((eds) => eds.filter((e) => e.id !== id));
    setSelectedEdgeId(null);
  }, [setEdges, recordHistory, setSelectedEdgeId]);

  // --- Duplicate ---
  const duplicateNode = useCallback((id: string) => {
    const nodeToDuplicate = nodes.find((n) => n.id === id);
    if (!nodeToDuplicate) return;
    recordHistory();
    const newNodeId = `${Date.now()}`;
    const newNode: Node = {
      ...nodeToDuplicate,
      id: newNodeId,
      position: { x: nodeToDuplicate.position.x + 50, y: nodeToDuplicate.position.y + 50 },
      selected: true,
    };
    setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), newNode]);
    setSelectedNodeId(newNodeId);
  }, [nodes, recordHistory, setNodes, setSelectedNodeId]);

  // --- Connection ---
  const onConnect = useCallback((params: Connection) => {
    recordHistory();
    setEdges((eds) =>
      addEdge({
        ...params,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        animated: true,
        style: EDGE_STYLE,
        labelStyle: EDGE_LABEL_STYLE,
        labelBgStyle: EDGE_LABEL_BG_STYLE,
        labelBgPadding: [8, 4] as [number, number],
        labelBgBorderRadius: 4,
      }, eds)
    );
  }, [setEdges, recordHistory]);

  // --- Selection ---
  const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
    setSelectedNodeId(selectedNodes.length > 0 ? selectedNodes[0].id : null);
    setSelectedEdgeId(selectedNodes.length === 0 && selectedEdges.length > 0 ? selectedEdges[0].id : null);
  }, [setSelectedNodeId, setSelectedEdgeId]);

  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  // --- Add Nodes ---
  const handleAddNode = useCallback(() => {
    recordHistory();
    const id = `${Date.now()}`;
    const newNode: Node = {
      id,
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { label: 'New Node', subLabel: 'Process Step', icon: 'Settings', color: 'slate' },
      type: 'process',
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(id);
  }, [setNodes, recordHistory, setSelectedNodeId]);

  const handleAddAnnotation = useCallback(() => {
    recordHistory();
    const id = `${Date.now()}`;
    const newNode: Node = {
      id,
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { label: 'Note', subLabel: 'Add your comments here.', color: 'yellow' },
      type: 'annotation',
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(id);
  }, [setNodes, recordHistory, setSelectedNodeId]);

  const handleAddSection = useCallback(() => {
    recordHistory();
    const id = `section-${Date.now()}`;
    const newNode: Node = {
      id,
      position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
      data: { label: 'New Section', subLabel: '', color: 'blue' },
      type: 'section',
      style: { width: 500, height: 400 },
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(id);
  }, [setNodes, recordHistory, setSelectedNodeId]);

  // --- Drag into/out of Section ---
  const onNodeDragStart = useCallback(() => {
    recordHistory();
  }, [recordHistory]);

  const onNodeDragStop = useCallback((_event: React.MouseEvent, draggedNode: Node) => {
    if (draggedNode.type === 'section') return;

    const sectionNodes = nodes.filter((n) => n.type === 'section' && n.id !== draggedNode.id);
    let newParent: Node | null = null;

    for (const section of sectionNodes) {
      const sW = (section.style?.width as number) || 500;
      const sH = (section.style?.height as number) || 400;
      const sX = section.position.x;
      const sY = section.position.y;

      if (
        draggedNode.position.x > sX &&
        draggedNode.position.x < sX + sW &&
        draggedNode.position.y > sY &&
        draggedNode.position.y < sY + sH
      ) {
        newParent = section;
        break;
      }
    }

    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== draggedNode.id) return n;
        if (newParent) {
          return {
            ...n,
            parentNode: newParent.id,
            extent: 'parent' as const,
            position: {
              x: n.position.x - newParent.position.x,
              y: n.position.y - newParent.position.y,
            },
          };
        } else if (n.parentNode) {
          const parent = nds.find((p) => p.id === n.parentNode);
          const absX = parent ? n.position.x + parent.position.x : n.position.x;
          const absY = parent ? n.position.y + parent.position.y : n.position.y;
          const { parentNode, extent, ...rest } = n as any;
          return { ...rest, position: { x: absX, y: absY } };
        }
        return n;
      })
    );
  }, [nodes, setNodes]);

  // --- Clear Canvas ---
  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the canvas?')) {
      recordHistory();
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges, recordHistory]);

  return {
    updateNodeData,
    updateNodeType,
    updateEdge,
    deleteNode,
    deleteEdge,
    duplicateNode,
    onConnect,
    onSelectionChange,
    onNodeDoubleClick,
    onNodeDragStart,
    onNodeDragStop,
    handleAddNode,
    handleAddAnnotation,
    handleAddSection,
    handleClear,
  };
};
