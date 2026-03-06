import { useMemo, useState } from 'react';
import type { FlowEdge, FlowNode, NodeData } from '@/lib/types';

type SetFlowNodes = (payload: FlowNode[] | ((nodes: FlowNode[]) => FlowNode[])) => void;
type SetFlowEdges = (payload: FlowEdge[] | ((edges: FlowEdge[]) => FlowEdge[])) => void;

interface UseFlowCanvasQuickActionsParams {
    layerAdjustedNodes: FlowNode[];
    zoom: number;
    viewportX: number;
    viewportY: number;
    recordHistory: () => void;
    setNodes: SetFlowNodes;
    setEdges: SetFlowEdges;
    setSelectedNodeId: (id: string | null) => void;
    duplicateNode: (nodeId: string) => void;
    handleAddAndConnect: (
        type: string,
        position: { x: number; y: number },
        sourceId?: string,
        sourceHandle?: string,
        shape?: NodeData['shape']
    ) => void;
    updateNodeData: (id: string, updates: Partial<NodeData>) => void;
}

export interface FlowCanvasQuickAddOverlay {
    buttonLeft: number;
    buttonTop: number;
    previewLeft: number;
    previewTop: number;
    previewWidth: number;
    previewHeight: number;
}

export function useFlowCanvasQuickActions({
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
}: UseFlowCanvasQuickActionsParams) {
    const [isQuickAddHovering, setIsQuickAddHovering] = useState(false);

    const selectedVisibleNodes = useMemo(
        () => layerAdjustedNodes.filter((node) => node.selected && !node.hidden),
        [layerAdjustedNodes]
    );

    const quickToolbarAnchor = useMemo(() => {
        if (selectedVisibleNodes.length === 0) {
            return null;
        }
        const primaryNode = selectedVisibleNodes[0];
        const nodeWidth = primaryNode.width ?? 220;
        return {
            left: (primaryNode.position.x + nodeWidth / 2) * zoom + viewportX,
            top: primaryNode.position.y * zoom + viewportY - 18,
        };
    }, [selectedVisibleNodes, viewportX, viewportY, zoom]);

    const quickToolbarColorValue = useMemo(() => {
        if (selectedVisibleNodes.length === 0) return '#e2e8f0';
        const rawColor = selectedVisibleNodes[0].data?.backgroundColor;
        if (typeof rawColor === 'string' && /^#[\da-fA-F]{6}$/.test(rawColor)) {
            return rawColor;
        }
        return '#e2e8f0';
    }, [selectedVisibleNodes]);

    const singleSelectedNode = selectedVisibleNodes.length === 1 ? selectedVisibleNodes[0] : null;

    const quickAddOverlay = useMemo<FlowCanvasQuickAddOverlay | null>(() => {
        if (!singleSelectedNode) {
            return null;
        }
        const width = singleSelectedNode.width ?? 220;
        const height = singleSelectedNode.height ?? 120;
        const left = (singleSelectedNode.position.x + width) * zoom + viewportX;
        const top = (singleSelectedNode.position.y + height / 2) * zoom + viewportY;
        return {
            buttonLeft: left + 28,
            buttonTop: top,
            previewLeft: left + 84,
            previewTop: top - (height * zoom) / 2,
            previewWidth: width * zoom,
            previewHeight: height * zoom,
        };
    }, [singleSelectedNode, viewportX, viewportY, zoom]);

    const onQuickToolbarDelete = (): void => {
        const selectedIds = new Set(selectedVisibleNodes.map((node) => node.id));
        if (selectedIds.size === 0) return;
        recordHistory();
        setNodes((nodes) => nodes.filter((node) => !selectedIds.has(node.id)));
        setEdges((edges) => edges.filter((edge) => !selectedIds.has(edge.source) && !selectedIds.has(edge.target)));
        setSelectedNodeId(null);
    };

    const onQuickToolbarDuplicate = (): void => {
        if (selectedVisibleNodes.length !== 1) return;
        duplicateNode(selectedVisibleNodes[0].id);
    };

    const onQuickToolbarAddConnected = (): void => {
        if (selectedVisibleNodes.length !== 1) return;
        const sourceNode = selectedVisibleNodes[0];
        const position = {
            x: sourceNode.position.x + 260,
            y: sourceNode.position.y,
        };
        handleAddAndConnect('process', position, sourceNode.id, 'right', 'rounded');
    };

    const onQuickToolbarColorChange = (nextColor: string): void => {
        selectedVisibleNodes.forEach((node) => {
            updateNodeData(node.id, { backgroundColor: nextColor });
        });
    };

    return {
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
    };
}
