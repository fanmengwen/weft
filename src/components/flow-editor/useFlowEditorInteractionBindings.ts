import { useCallback } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { FlowEdge, FlowNode } from '@/lib/types';
import { useNodeQuickCreateRequest } from '@/hooks/nodeQuickCreateRequest';
import { nextCanvasZoom } from '@/lib/canvasZoom';

interface UseFlowEditorInteractionBindingsParams {
    selectedNodeId: string | null;
    selectedEdgeId: string | null;
    selectedNodeType: string | null;
    deleteNode: (id: string) => void;
    deleteEdge: (id: string) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndoUnavailable: () => void;
    onRedoUnavailable: () => void;
    duplicateNode: (id: string) => void;
    selectAll: () => void;
    openCommandBar: (view: 'root' | 'search' | 'assets' | 'templates' | 'layout' | 'design-system') => void;
    setShortcutsHelpOpen: (open: boolean) => void;
    enableSelectMode: () => void;
    enablePanMode: () => void;
    closeElementPalette: () => void;
    toggleElementPalette: () => void;
    onAutoLayout: () => void;
    fitView: (options?: { duration?: number; padding?: number }) => void;
    getZoom: () => number;
    zoomTo: (zoom: number, options?: { duration?: number }) => void;
    copySelection: () => void;
    pasteSelection: () => void;
    copyStyleSelection: () => void;
    pasteStyleSelection: () => void;
    createConnectedNodeInDirection: (nodeId: string, direction: 'up' | 'right' | 'down' | 'left') => void;
    updateNodeData: (id: string, data: Partial<FlowNode['data']>) => void;
    setSelectedNodeId: (id: string | null) => void;
    setSelectedEdgeId: (id: string | null) => void;
    setNodes: (updater: (nodes: FlowNode[]) => FlowNode[]) => void;
    setEdges: (updater: (edges: FlowEdge[]) => FlowEdge[]) => void;
}

export function useFlowEditorInteractionBindings({
    selectedNodeId,
    selectedEdgeId,
    selectedNodeType,
    deleteNode,
    deleteEdge,
    undo,
    redo,
    canUndo,
    canRedo,
    onUndoUnavailable,
    onRedoUnavailable,
    duplicateNode,
    selectAll,
    openCommandBar,
    setShortcutsHelpOpen,
    enableSelectMode,
    enablePanMode,
    closeElementPalette,
    toggleElementPalette,
    onAutoLayout,
    fitView,
    getZoom,
    zoomTo,
    copySelection,
    pasteSelection,
    copyStyleSelection,
    pasteStyleSelection,
    createConnectedNodeInDirection,
    updateNodeData,
    setSelectedNodeId,
    setSelectedEdgeId,
    setNodes,
    setEdges,
}: UseFlowEditorInteractionBindingsParams) {
    useKeyboardShortcuts({
        selectedNodeId,
        selectedEdgeId,
        deleteNode,
        deleteEdge,
        undo,
        redo,
        canUndo,
        canRedo,
        onUndoUnavailable,
        onRedoUnavailable,
        duplicateNode,
        selectAll,
        selectedNodeType,
        onCommandBar: () => openCommandBar('root'),
        onSearch: () => openCommandBar('search'),
        onShortcutsHelp: () => setShortcutsHelpOpen(true),
        onSelectMode: enableSelectMode,
        onPanMode: enablePanMode,
        onToggleElementPalette: toggleElementPalette,
        onAutoLayout,
        onFitView: () => fitView({ duration: 600, padding: 0.2 }),
        onZoomIn: () => zoomTo(nextCanvasZoom(getZoom(), 1), { duration: 300 }),
        onZoomOut: () => zoomTo(nextCanvasZoom(getZoom(), -1), { duration: 300 }),
        onCopy: copySelection,
        onPaste: pasteSelection,
        onCopyStyle: copyStyleSelection,
        onPasteStyle: pasteStyleSelection,
        onQuickCreateShortcut: (direction) => {
            if (selectedNodeId) {
                createConnectedNodeInDirection(selectedNodeId, direction);
            }
        },
        onAnnotationColorShortcut: (color) => {
            if (selectedNodeId) {
                updateNodeData(selectedNodeId, { color });
            }
        },
        onClearSelection: () => {
            closeElementPalette();
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
            setNodes((nodes) => nodes.map((node) => ({ ...node, selected: false })));
            setEdges((edges) => edges.map((edge) => ({ ...edge, selected: false })));
        },
        onNudge: (dx, dy) => {
            setNodes((nodes) => nodes.map((node) =>
                node.selected
                    ? { ...node, position: { x: node.position.x + dx, y: node.position.y + dy } }
                    : node
            ));
        },
        onTogglePinPositionShortcut: () => {
            // Pin/unpin every selected non-section node. Sections are skipped
            // because their bounds derive from children (auto-layout owns them).
            setNodes((nodes) => {
                const selectedNonSections = nodes.filter(
                    (node) => node.selected && node.type !== 'section'
                );
                if (selectedNonSections.length === 0) return nodes;
                const anyUnpinned = selectedNonSections.some(
                    (node) => node.data?.pinned !== true
                );
                return nodes.map((node) =>
                    node.selected && node.type !== 'section'
                        ? { ...node, data: { ...node.data, pinned: anyUnpinned } }
                        : node
                );
            });
        },
    });

    useNodeQuickCreateRequest(
        useCallback((nodeId, direction) => {
            createConnectedNodeInDirection(nodeId, direction);
        }, [createConnectedNodeInDirection])
    );
}
