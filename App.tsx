import React, { useState, useMemo, useRef, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
  MiniMap,
  getRectOfNodes,
} from 'reactflow';
import dagre from 'dagre';
import CustomNode from './components/CustomNode';
import AnnotationNode from './components/AnnotationNode';
import SectionNode from './components/SectionNode';
import { AIPanel } from './components/AIPanel';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { FlowTabs } from './components/FlowTabs';
import { TemplatesPanel } from './components/TemplatesPanel';
import { SnapshotsPanel } from './components/SnapshotsPanel';
import { FlowTemplate } from './services/templates';
import { toMermaid, toPlantUML } from './services/exportService';
import { LayoutGrid } from 'lucide-react';
import { useSnapshots } from './hooks/useSnapshots';
import { useAutoSave } from './hooks/useAutoSave';

// Hooks
import { useFlowHistory } from './hooks/useFlowHistory';
import { useFlowOperations } from './hooks/useFlowOperations';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAIGeneration } from './hooks/useAIGeneration';
import { useFlowExport } from './hooks/useFlowExport';

// Constants
import { INITIAL_NODES, INITIAL_EDGES, NODE_WIDTH, NODE_HEIGHT, EDGE_STYLE, EDGE_LABEL_STYLE, EDGE_LABEL_BG_STYLE } from './constants';
import { FlowTab } from './types';

const FlowEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  // Tab State
  const [tabs, setTabs] = useState<FlowTab[]>([
    {
      id: 'tab-1',
      name: 'Untitled Flow',
      nodes: INITIAL_NODES,
      edges: INITIAL_EDGES,
      history: { past: [], future: [] },
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  // Selection
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Templates
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  // Snapshots
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { snapshots, saveSnapshot, deleteSnapshot, restoreSnapshot } = useSnapshots();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  // --- Node Types ---
  const nodeTypes = useMemo(() => ({
    start: CustomNode,
    process: CustomNode,
    decision: CustomNode,
    end: CustomNode,
    custom: CustomNode,
    annotation: AnnotationNode,
    section: SectionNode,
  }), []);

  // --- History ---
  const { recordHistory, undo, redo, canUndo, canRedo, setPast, setFuture, past, future } = useFlowHistory(
    nodes, edges, setNodes, setEdges
  );

  // --- Auto Save ---
  useAutoSave(
    tabs, activeTabId, nodes, edges,
    setTabs, setActiveTabId,
    setNodes, setEdges,
    past, future, setPast, setFuture
  );

  // --- Tab Management ---
  const handleSwitchTab = useCallback((newTabId: string) => {
    if (newTabId === activeTabId) return;

    // 1. Save current state to tabs array
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            nodes,
            edges,
            history: { past, future },
          };
        }
        return tab;
      })
    );

    // 2. Load new state
    const newTab = tabs.find((t) => t.id === newTabId);
    if (newTab) {
      setNodes(newTab.nodes);
      setEdges(newTab.edges);
      setPast(newTab.history.past);
      setFuture(newTab.history.future);
      setActiveTabId(newTabId);
      setTimeout(() => fitView({ duration: 800 }), 50);
    }
  }, [activeTabId, tabs, nodes, edges, past, future, setNodes, setEdges, setPast, setFuture, fitView]);

  const handleAddTab = useCallback(() => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: FlowTab = {
      id: newTabId,
      name: 'New Flow',
      nodes: [],
      edges: [],
      history: { past: [], future: [] },
    };

    // Save current tab state first
    setTabs((prevTabs) => [
      ...prevTabs.map((tab) => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            nodes,
            edges,
            history: { past, future },
          };
        }
        return tab;
      }),
      newTab
    ]);

    // Switch to new tab
    setNodes(newTab.nodes);
    setEdges(newTab.edges);
    setPast(newTab.history.past);
    setFuture(newTab.history.future);
    setActiveTabId(newTabId);
  }, [activeTabId, nodes, edges, past, future, setNodes, setEdges, setPast, setFuture]);

  const handleCloseTab = useCallback((tabId: string) => {
    if (tabs.length === 1) {
      alert("Cannot close the last tab.");
      return;
    }

    // Determine new active tab if closing the active one
    let newActiveTabId = activeTabId;
    if (tabId === activeTabId) {
      const index = tabs.findIndex(t => t.id === tabId);
      const nextTab = tabs[index + 1] || tabs[index - 1];
      if (nextTab) {
        newActiveTabId = nextTab.id;
        // Load next tab content immediately since we are switching
        setNodes(nextTab.nodes);
        setEdges(nextTab.edges);
        setPast(nextTab.history.past);
        setFuture(nextTab.history.future);
      }
    }

    setTabs((prev) => prev.filter((t) => t.id !== tabId));
    setActiveTabId(newActiveTabId);
  }, [tabs, activeTabId, setNodes, setEdges, setPast, setFuture]);

  const handleRenameTab = useCallback((tabId: string, newName: string) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, name: newName } : t)));
  }, []);


  // --- Core Operations ---
  const {
    updateNodeData, updateNodeType, updateEdge,
    deleteNode, deleteEdge, duplicateNode,
    onConnect, onSelectionChange, onNodeDoubleClick,
    onNodeDragStart, onNodeDragStop,
    handleAddNode, handleAddAnnotation, handleAddSection,
    handleClear,
  } = useFlowOperations(
    nodes, edges, setNodes, setEdges, recordHistory, setSelectedNodeId, setSelectedEdgeId
  );

  // --- Keyboard Shortcuts ---
  useKeyboardShortcuts({
    selectedNodeId, selectedEdgeId,
    deleteNode, deleteEdge, undo, redo, duplicateNode,
  });

  // --- AI ---
  const { isAIOpen, setIsAIOpen, isGenerating, handleAIRequest } = useAIGeneration(
    nodes, edges, setNodes, setEdges, recordHistory, fitView
  );

  // --- Export ---
  const { fileInputRef, handleExport, handleExportJSON, handleImportJSON, onFileImport } = useFlowExport(
    nodes, edges, setNodes, setEdges, recordHistory, fitView, reactFlowWrapper
  );

  // --- Auto Layout (dagre) ---
  const onLayout = useMemo(() => () => {
    recordHistory();
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB' });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const pos = dagreGraph.node(node.id);
      return { ...node, position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 } };
    });

    setNodes(layoutedNodes);
    setTimeout(() => fitView({ duration: 800 }), 10);
  }, [nodes, edges, recordHistory, setNodes, fitView]);

  const handleInsertTemplate = useCallback((template: FlowTemplate) => {
    recordHistory();
    const bounds = getRectOfNodes(nodes);
    // Position to the right of current content
    const startX = (bounds.width || 0) + (bounds.x || 0) + 100;
    const startY = (bounds.y || 0);

    const newNodes = template.nodes.map((n) => ({
      ...n,
      id: `${n.id}-${Date.now()}`,
      position: { x: n.position.x + startX, y: n.position.y + startY },
      selected: false,
    }));

    const idMap = new Map<string, string>();
    template.nodes.forEach((n, i) => idMap.set(n.id, newNodes[i].id));

    const newEdges = template.edges.map((e) => ({
      ...e,
      id: `${e.id}-${Date.now()}`,
      source: idMap.get(e.source)!,
      target: idMap.get(e.target)!,
    }));

    setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);
    setIsTemplatesOpen(false);
    setTimeout(() => fitView({ duration: 800 }), 100);
  }, [nodes, recordHistory, setNodes, setEdges, fitView]);

  const handleExportMermaid = useCallback(async () => {
    const text = toMermaid(nodes, edges);
    try {
      await navigator.clipboard.writeText(text);
      // Ideally show a toast
      alert('Mermaid diagram copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }, [nodes, edges]);

  const handleExportPlantUML = useCallback(async () => {
    const text = toPlantUML(nodes, edges);
    try {
      await navigator.clipboard.writeText(text);
      alert('PlantUML diagram copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }, [nodes, edges]);

  const handleRestoreSnapshot = useCallback((snapshot: any) => {
    restoreSnapshot(snapshot, setNodes, setEdges);
    recordHistory(); // Record the restoration as a new history step
    // setIsHistoryOpen(false); // Optional: close panel on restore?
  }, [restoreSnapshot, setNodes, setEdges, recordHistory]);

  // --- Derived State ---
  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);
  const selectedEdge = useMemo(() => edges.find((e) => e.id === selectedEdgeId) || null, [edges, selectedEdgeId]);

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col relative" ref={reactFlowWrapper}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 pointer-events-none flex items-center justify-between">
        <div className="pointer-events-auto bg-white/80 backdrop-blur rounded-full px-4 py-2 border border-slate-200 shadow-sm flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-indigo-600" />
          <span className="font-bold text-slate-800 tracking-tight">FlowMind AI</span>
          <span className="text-xs font-medium px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">Beta</span>
        </div>
      </div>

      <FlowTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onSwitchTab={handleSwitchTab}
        onAddTab={handleAddTab}
        onCloseTab={handleCloseTab}
        onRenameTab={handleRenameTab}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-50 pt-16"
        minZoom={0.1}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: EDGE_STYLE,
          labelStyle: EDGE_LABEL_STYLE,
          labelBgStyle: EDGE_LABEL_BG_STYLE,
          labelBgPadding: [8, 4] as [number, number],
          labelBgBorderRadius: 4,
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
        <Controls className="bg-white border-slate-200 shadow-xl rounded-lg" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'start') return '#10b981';
            if (n.type === 'end') return '#ef4444';
            if (n.type === 'decision') return '#f59e0b';
            if (n.type === 'annotation') return '#facc15';
            if (n.type === 'section') return '#60a5fa';
            return '#64748b';
          }}
          maskColor="rgba(241, 245, 249, 0.7)"
          className="border border-slate-200 shadow-lg rounded-lg overflow-hidden"
        />
      </ReactFlow>

      <Toolbar
        onAI={() => setIsAIOpen(true)}
        onExport={handleExport}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onClear={handleClear}
        onFitView={() => fitView({ duration: 800 })}
        onAddNode={handleAddNode}
        onAddAnnotation={handleAddAnnotation}
        onAddSection={handleAddSection}
        onUndo={undo}
        onRedo={redo}
        onLayout={onLayout}
        onTemplates={() => setIsTemplatesOpen(true)}
        onHistory={() => setIsHistoryOpen(true)}
        onExportMermaid={handleExportMermaid}
        onExportPlantUML={handleExportPlantUML}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <AIPanel
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onGenerate={handleAIRequest}
        isGenerating={isGenerating}
      />

      <TemplatesPanel
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleInsertTemplate}
      />

      <SnapshotsPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        snapshots={snapshots}
        onSaveSnapshot={(name) => saveSnapshot(name, nodes, edges)}
        onRestoreSnapshot={handleRestoreSnapshot}
        onDeleteSnapshot={deleteSnapshot}
      />

      <PropertiesPanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        onChangeNode={updateNodeData}
        onChangeNodeType={updateNodeType}
        onChangeEdge={updateEdge}
        onDeleteNode={deleteNode}
        onDuplicateNode={duplicateNode}
        onDeleteEdge={deleteEdge}
        onClose={() => {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
        }}
      />

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-center space-y-4 opacity-40">
            <div className="w-24 h-24 bg-slate-200 rounded-2xl mx-auto border-4 border-dashed border-slate-300 animate-pulse"></div>
            <p className="text-2xl font-bold text-slate-400">Canvas is empty</p>
            <p className="text-slate-400">Ask AI to build a flow or add nodes manually</p>
          </div>
        </div>
      )}

      {/* Hidden file input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={onFileImport}
        className="hidden"
      />
    </div>
  );
};

function App() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}

export default App;