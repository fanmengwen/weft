import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    SelectionMode,
    MarkerType,
    useReactFlow,
    ConnectionMode,
    useViewport,
    toFlowNode,
} from '@/lib/reactflowCompat';
import { useFlowStore } from '../store';
import type { FlowNode, NodeData } from '../lib/types';
import { useFlowOperations } from '../hooks/useFlowOperations';
import { useModifierKeys } from '../hooks/useModifierKeys';
import { useEdgeInteractions } from '../hooks/useEdgeInteractions';
import CustomConnectionLine from './CustomConnectionLine';
import { ConnectMenu } from './ConnectMenu';
import { ContextMenu } from './ContextMenu';
import { NavigationControls } from './NavigationControls';
import { MINIMAP_NODE_COLORS } from '../constants';
import { flowCanvasEdgeTypes, flowCanvasNodeTypes, isDuplicateConnection } from './flow-canvas/flowCanvasTypes';
import { useFlowCanvasMenus } from './flow-canvas/useFlowCanvasMenus';
import { useFlowCanvasDragDrop } from './flow-canvas/useFlowCanvasDragDrop';
import { useFlowCanvasConnectionState } from './flow-canvas/useFlowCanvasConnectionState';
import { useFlowCanvasContextActions } from './flow-canvas/useFlowCanvasContextActions';
import { useFlowCanvasQuickActions } from './flow-canvas/useFlowCanvasQuickActions';
import { FlowCanvasQuickActions } from './flow-canvas/FlowCanvasQuickActions';
import { useFlowCanvasPaste } from './flow-canvas/useFlowCanvasPaste';
import { FlowCanvasAlignmentGuidesOverlay } from './flow-canvas/FlowCanvasAlignmentGuidesOverlay';
import { useFlowCanvasAlignmentGuides } from './flow-canvas/useFlowCanvasAlignmentGuides';
import { useFlowCanvasNodeDragHandlers } from './flow-canvas/useFlowCanvasNodeDragHandlers';
import { useFlowCanvasInteractionLod } from './flow-canvas/useFlowCanvasInteractionLod';
import {
    getSafetyAdjustedEdges,
    isFarZoomReductionActiveForProfile,
    isLargeGraphSafetyActive,
    isLowDetailModeActiveForProfile,
    shouldEnableViewportCulling,
} from './flow-canvas/largeGraphSafetyMode';
import { useToast } from './ui/ToastContext';
import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import { isPaneTarget } from '@/hooks/edgeConnectInteractions';

interface FlowCanvasProps {
    recordHistory: () => void;
    isSelectMode: boolean;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
    recordHistory,
    isSelectMode
}) => {
    const { t } = useTranslation();
    const visualQualityV2Enabled = ROLLOUT_FLAGS.visualQualityV2;
    const canvasInteractionsV1Enabled = ROLLOUT_FLAGS.canvasInteractionsV1;
    const {
        nodes, edges,
        onNodesChange, onEdgesChange,
        layers,
        activeTabId,
        updateTab,
        setNodes,
        setEdges,
        selectedNodeId,
        setSelectedNodeId,
        setSelectedEdgeId,
        setMermaidDiagnostics,
        clearMermaidDiagnostics,
        viewSettings: { showGrid, snapToGrid, showMiniMap, largeGraphSafetyMode, largeGraphSafetyProfile, architectureStrictMode },
    } = useFlowStore();
    const { addToast } = useToast();
    const safetyModeActive = isLargeGraphSafetyActive(nodes.length, edges.length, largeGraphSafetyMode, largeGraphSafetyProfile);
    const viewportCullingEnabled = shouldEnableViewportCulling(safetyModeActive);
    const effectiveShowGrid = showGrid && !safetyModeActive;
    const effectiveShowMiniMap = showMiniMap;
    const layerById = useMemo(
        () => new Map(layers.map((layer) => [layer.id, layer])),
        [layers]
    );
    const layerAdjustedNodes = useMemo(() => nodes.map((node) => {
        const layerId = node.data?.layerId ?? 'default';
        const layer = layerById.get(layerId);
        const isVisible = layer?.visible ?? true;
        const isLocked = layer?.locked ?? false;
        const isStoreSelected = selectedNodeId === node.id;
        return {
            ...node,
            hidden: !isVisible,
            selected: isVisible ? Boolean(node.selected || isStoreSelected) : false,
            draggable: !isLocked,
        };
    }), [nodes, layerById, selectedNodeId]);
    const visibleNodeIds = useMemo(
        () => new Set(layerAdjustedNodes.filter((node) => !node.hidden).map((node) => node.id)),
        [layerAdjustedNodes]
    );
    const visibleEdges = useMemo(
        () => edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)),
        [edges, visibleNodeIds]
    );
    const effectiveEdges = useMemo(() => getSafetyAdjustedEdges(visibleEdges, safetyModeActive), [visibleEdges, safetyModeActive]);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    const { screenToFlowPosition, fitView } = useReactFlow();
    const { zoom, x: viewportX, y: viewportY } = useViewport();
    const clearPaneSelection = useCallback((): void => {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
    }, [setSelectedEdgeId, setSelectedNodeId]);
    const {
        connectMenu,
        setConnectMenu,
        contextMenu,
        onNodeContextMenu,
        onPaneContextMenu,
        onEdgeContextMenu,
        onPaneClick,
        onCloseContextMenu,
    } = useFlowCanvasMenus({
        onPaneSelectionClear: clearPaneSelection,
    });

    // --- Operations ---
    const {
        onConnect, onSelectionChange, onNodeDoubleClick,
        onNodeDragStart, onNodeDragStop,
        onConnectStart, onConnectEnd,
        handleAddAndConnect,
        handleAddNode,
        updateNodeData,
        deleteNode, deleteEdge, duplicateNode,
        updateNodeZIndex,
        pasteSelection, copySelection,
        handleAlignNodes, handleDistributeNodes, handleGroupNodes,
        onReconnect,
        onNodeDrag,
        handleAddImage
    } = useFlowOperations(
        recordHistory,
        (position, sourceId, sourceHandle) => setConnectMenu({ position, sourceId, sourceHandle })
    );

    const { onDragOver, onDrop } = useFlowCanvasDragDrop({
        screenToFlowPosition,
        handleAddImage,
    });

    // --- Keyboard Shortcuts ---
    const { isSelectionModifierPressed } = useModifierKeys();
    useEdgeInteractions();

    const isEffectiveSelectMode = isSelectMode || isSelectionModifierPressed;
    const lowDetailModeActive = isLowDetailModeActiveForProfile(safetyModeActive, zoom, largeGraphSafetyProfile);
    const {
        interactionLowDetailModeActive,
        startInteractionLowDetail,
        endInteractionLowDetail,
    } = useFlowCanvasInteractionLod({
        safetyModeActive,
        largeGraphSafetyProfile,
    });
    const farZoomReductionActive = isFarZoomReductionActiveForProfile(safetyModeActive, zoom, largeGraphSafetyProfile);
    const { isConnecting, onConnectStartWrapper, onConnectEndWrapper } = useFlowCanvasConnectionState({
        onConnectStart: (event, params) => {
            onConnectStart(event as Parameters<typeof onConnectStart>[0], params as Parameters<typeof onConnectStart>[1]);
        },
        onConnectEnd: (event) => {
            onConnectEnd(event as Parameters<typeof onConnectEnd>[0]);
        },
    });
    const contextActions = useFlowCanvasContextActions({
        contextMenu,
        onCloseContextMenu,
        screenToFlowPosition,
        copySelection,
        pasteSelection,
        duplicateNode,
        deleteNode,
        deleteEdge,
        updateNodeZIndex,
        handleAlignNodes,
        handleDistributeNodes,
        handleGroupNodes,
        nodes,
    });
    const getCanvasCenterFlowPosition = (): { x: number; y: number } => {
        if (!reactFlowWrapper.current) {
            return screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        }
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        return screenToFlowPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        });
    };

    const {
        selectedVisibleNodes,
        quickToolbarAnchor,
        quickToolbarColorValue,
        singleSelectedNode,
        quickAddOverlay,
        isQuickAddHovering,
        setIsQuickAddHovering,
        onQuickToolbarDelete,
        onQuickToolbarDuplicate,
        onQuickToolbarAddConnected,
        onQuickToolbarColorChange,
    } = useFlowCanvasQuickActions({
        layerAdjustedNodes,
        zoom,
        viewportX,
        viewportY,
        recordHistory,
        setNodes,
        setEdges,
        setSelectedNodeId,
        duplicateNode,
        handleAddAndConnect,
        updateNodeData,
    });
    const {
        alignmentGuides,
        updateAlignmentGuidesForNode,
        clearAlignmentGuides,
    } = useFlowCanvasAlignmentGuides({
        enabled: canvasInteractionsV1Enabled,
        layerAdjustedNodes,
    });
    const {
        handleNodeDragStart,
        handleNodeDrag,
        handleNodeDragStop,
    } = useFlowCanvasNodeDragHandlers({
        toTypedFlowNode: (node) => toTypedFlowNode(node as Parameters<typeof toFlowNode>[0]),
        onNodeDragStart: (event, node) => onNodeDragStart(event as Parameters<typeof onNodeDragStart>[0], node),
        onNodeDrag: (event, node, draggedNodes) => onNodeDrag(event as Parameters<typeof onNodeDrag>[0], node, draggedNodes),
        onNodeDragStop: (event, node) => onNodeDragStop(event as Parameters<typeof onNodeDragStop>[0], node),
        startInteractionLowDetail,
        endInteractionLowDetail,
        updateAlignmentGuidesForNode,
        clearAlignmentGuides,
    });

    const onCanvasDoubleClickCapture = (event: React.MouseEvent<HTMLDivElement>): void => {
        if (!canvasInteractionsV1Enabled) return;
        if (!isPaneTarget(event.target)) return;
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        handleAddNode(position);
    };

    function toTypedFlowNode(node: Parameters<typeof toFlowNode>[0]): FlowNode {
        return toFlowNode<NodeData>(node);
    }

    const { handleCanvasPaste } = useFlowCanvasPaste({
        architectureStrictMode,
        activeTabId,
        fitView,
        updateTab,
        recordHistory,
        setNodes,
        setEdges,
        setSelectedNodeId,
        setMermaidDiagnostics,
        clearMermaidDiagnostics,
        addToast,
        strictModePasteBlockedMessage: t(
            'flowCanvas.strictModePasteBlocked',
            'Architecture strict mode blocked Mermaid paste. Open Code view, fix diagnostics, then retry.'
        ),
        pasteSelection,
        getCanvasCenterFlowPosition,
    });

    return (
        <div
            className={`w-full h-full relative ${isConnecting ? 'is-connecting' : ''} ${lowDetailModeActive ? 'flow-lod-low' : ''} ${interactionLowDetailModeActive ? 'flow-lod-interaction' : ''} ${farZoomReductionActive ? 'flow-lod-far' : ''}`}
            ref={reactFlowWrapper}
            onPasteCapture={handleCanvasPaste}
            onDoubleClickCapture={onCanvasDoubleClickCapture}
        >
            <ReactFlow
                nodes={layerAdjustedNodes}
                edges={effectiveEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onReconnect={onReconnect}
                onSelectionChange={onSelectionChange}
                onNodeDragStart={handleNodeDragStart}
                onNodeDrag={handleNodeDrag}
                onNodeDragStop={handleNodeDragStop}
                onMoveStart={startInteractionLowDetail}
                onMoveEnd={endInteractionLowDetail}
                onNodeDoubleClick={onNodeDoubleClick}
                onNodeContextMenu={onNodeContextMenu}
                onPaneContextMenu={onPaneContextMenu}
                onEdgeContextMenu={onEdgeContextMenu}
                onPaneClick={onPaneClick}

                onConnectStart={onConnectStartWrapper}
                onConnectEnd={onConnectEndWrapper}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={flowCanvasNodeTypes}
                edgeTypes={flowCanvasEdgeTypes}
                fitView
                className={`bg-[var(--brand-background)] ${isEffectiveSelectMode ? 'flow-canvas-select-mode' : 'flow-canvas-pan-mode'}`}
                minZoom={0.1}
                onlyRenderVisibleElements={viewportCullingEnabled}
                connectionMode={ConnectionMode.Loose}
                isValidConnection={(connection) => {
                    return !isDuplicateConnection(connection, effectiveEdges);
                }}
                selectionOnDrag={isEffectiveSelectMode}
                panOnDrag={!isEffectiveSelectMode}
                selectionMode={isEffectiveSelectMode ? SelectionMode.Partial : undefined}
                multiSelectionKeyCode="Alt"
                defaultEdgeOptions={{
                    style: visualQualityV2Enabled ? { stroke: '#64748b', strokeWidth: 1.5 } : { stroke: '#94a3b8', strokeWidth: 2 },
                    animated: false,
                    markerEnd: { type: MarkerType.ArrowClosed, color: visualQualityV2Enabled ? '#64748b' : '#94a3b8' },
                }}
                connectionLineComponent={CustomConnectionLine}
                snapToGrid={snapToGrid}
            >
                {effectiveShowGrid && (
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={visualQualityV2Enabled ? 24 : 20}
                        size={1}
                        color={visualQualityV2Enabled ? 'rgba(148,163,184,0.35)' : '#cbd5e1'}
                    />
                )}
                <NavigationControls />
                {effectiveShowMiniMap && (
                    <MiniMap
                        nodeColor={(n) => MINIMAP_NODE_COLORS[n.type ?? ''] ?? '#64748b'}
                        maskColor="rgba(241, 245, 249, 0.7)"
                        className="border border-slate-200 shadow-lg rounded-lg overflow-hidden"
                    />
                )}
            </ReactFlow>
            <FlowCanvasAlignmentGuidesOverlay
                enabled={canvasInteractionsV1Enabled}
                alignmentGuides={alignmentGuides}
                zoom={zoom}
                viewportX={viewportX}
                viewportY={viewportY}
            />
            <FlowCanvasQuickActions
                enabled={canvasInteractionsV1Enabled}
                quickToolbarAnchor={quickToolbarAnchor}
                selectedVisibleNodes={selectedVisibleNodes}
                quickToolbarColorValue={quickToolbarColorValue}
                onQuickToolbarDelete={onQuickToolbarDelete}
                onQuickToolbarDuplicate={onQuickToolbarDuplicate}
                onQuickToolbarAddConnected={onQuickToolbarAddConnected}
                onQuickToolbarColorChange={onQuickToolbarColorChange}
                singleSelectedNode={singleSelectedNode}
                quickAddOverlay={quickAddOverlay}
                isQuickAddHovering={isQuickAddHovering}
                setIsQuickAddHovering={setIsQuickAddHovering}
            />

            {connectMenu && (
                <ConnectMenu
                    position={connectMenu.position}
                    onClose={() => setConnectMenu(null)}
                    onSelect={(type, shape) => {
                        if (connectMenu) {
                            const flowPos = screenToFlowPosition(connectMenu.position);
                            handleAddAndConnect(type, flowPos, connectMenu.sourceId, connectMenu.sourceHandle, shape as NodeData['shape']);
                        }
                    }}
                />
            )}
            {
                contextMenu.isOpen && (
                    <ContextMenu
                        {...contextMenu}
                        onClose={onCloseContextMenu}
                        onCopy={copySelection}
                        onPaste={contextActions.onPaste}
                        onDuplicate={contextActions.onDuplicate}
                        onDelete={contextActions.onDelete}
                        onSendToBack={contextActions.onSendToBack}
                        canPaste={true}
                        selectedCount={contextActions.selectedCount}
                        onAlignNodes={contextActions.onAlignNodes}
                        onDistributeNodes={contextActions.onDistributeNodes}
                        onGroupSelected={contextActions.onGroupSelected}
                    />
                )
            }
        </div>
    );
};
