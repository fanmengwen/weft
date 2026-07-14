import type { Connection } from '@/lib/reactflowCompat';
import type { EdgeData, FlowEdge, FlowNode, NodeData } from '@/lib/types';
import { DEFAULT_EDGE_OPTIONS, NODE_HEIGHT, NODE_WIDTH } from '@/constants';
import { getNodeHandleIdForSide, handleIdToSide, type HandleSide } from '@/lib/nodeHandles';
import { NODE_DEFAULTS } from '@/theme';
import { createGenericShapeNode } from '@/hooks/node-operations/utils';
import { getGenericShapeColor, isGenericShapeType } from '@/lib/genericShapePolicy';
import { createId } from '@/lib/id';
import { getDefaultConnectedNodeSpec } from '@/lib/connectCreationPolicy';

const OPPOSITE_HANDLE_SIDE: Record<HandleSide, HandleSide> = {
    right: 'left',
    left: 'right',
    top: 'bottom',
    bottom: 'top',
};

interface AddedNodeContentLabels {
    noteLabel: string;
    noteSubLabel: string;
}

interface AddedNodeContent {
    label: string;
    subLabel: string;
    icon?: string;
}

interface ClosestHandleTarget {
    nodeId: string;
    handleId: string;
    dist: number;
}

interface BuildConnectedNodeParams {
    type: string;
    position: { x: number; y: number };
    shape?: NodeData['shape'];
    labels: AddedNodeContentLabels;
    sourceNode?: FlowNode;
}

export interface ConnectedEdgePreset {
    label?: string;
    data?: EdgeData;
}

type ConnectEndResolution =
    | { type: 'connect'; connection: Connection }
    | {
        type: 'add';
        nodeType: string;
        shape?: NodeData['shape'];
        position: { x: number; y: number };
      }
    | {
        type: 'menu';
        clientPosition: { x: number; y: number };
        sourceType: string | null;
      }
    | { type: 'none' };

export function getOppositeTargetHandle(node: FlowNode, sourceHandle: string | null): string | null {
    if (!sourceHandle) {
        return null;
    }

    const sourceSide = handleIdToSide(sourceHandle);
    if (!sourceSide) {
        return null;
    }

    return getNodeHandleIdForSide(node, OPPOSITE_HANDLE_SIDE[sourceSide]);
}

export function isDuplicateConnection(edges: FlowEdge[], connection: Connection): boolean {
    return edges.some((edge) =>
        edge.source === connection.source &&
        edge.target === connection.target &&
        edge.sourceHandle === connection.sourceHandle &&
        edge.targetHandle === connection.targetHandle
    );
}

export function findClosestHandleTarget(
    nodes: FlowNode[],
    position: { x: number; y: number },
    maxDistance = 50
): ClosestHandleTarget | null {
    let closestHandle: ClosestHandleTarget | null = null;

    nodes.forEach((node) => {
        const handlePoints = [
            { side: 'top' as const, x: node.position.x + NODE_WIDTH / 2, y: node.position.y },
            { side: 'bottom' as const, x: node.position.x + NODE_WIDTH / 2, y: node.position.y + NODE_HEIGHT },
            { side: 'left' as const, x: node.position.x, y: node.position.y + NODE_HEIGHT / 2 },
            { side: 'right' as const, x: node.position.x + NODE_WIDTH, y: node.position.y + NODE_HEIGHT / 2 },
        ];

        handlePoints.forEach((handlePoint) => {
            const dist = Math.sqrt((handlePoint.x - position.x) ** 2 + (handlePoint.y - position.y) ** 2);
            if (dist < maxDistance && (!closestHandle || dist < closestHandle.dist)) {
                closestHandle = {
                    nodeId: node.id,
                    handleId: getNodeHandleIdForSide(node, handlePoint.side),
                    dist,
                };
            }
        });
    });

    return closestHandle;
}

export function getAddedNodeContent(type: string, labels: AddedNodeContentLabels): AddedNodeContent {
    if (type === 'annotation') {
        return {
            label: labels.noteLabel,
            subLabel: labels.noteSubLabel,
            icon: 'StickyNote',
        };
    }

    return {
        label: '',
        subLabel: '',
    };
}

export function buildConnectedNode({
    type,
    position,
    shape,
    labels,
    sourceNode,
}: BuildConnectedNodeParams): { newNode: FlowNode; isGenericShape: boolean } {
    const id = createId();
    const defaultStyle = NODE_DEFAULTS[type] || NODE_DEFAULTS.process;
    const isGenericShape = isGenericShapeType(type);
    const nodeContent = getAddedNodeContent(type, labels);

    if (type === 'architecture') {
        const sourceProvider = sourceNode?.data?.archProvider || 'custom';
        return {
            newNode: {
                id,
                type: 'architecture',
                position,
                data: {
                    label: 'New Service',
                    color: 'slate',
                    shape: 'rectangle',
                    icon: 'Server',
                    archProvider: sourceProvider,
                    archProviderLabel: sourceProvider === 'custom'
                        ? sourceNode?.data?.archProviderLabel
                        : undefined,
                    archResourceType: 'service',
                    archEnvironment: sourceNode?.data?.archEnvironment || 'default',
                    archBoundaryId: sourceNode?.data?.archBoundaryId,
                    archZone: sourceNode?.data?.archZone,
                    archTrustDomain: sourceNode?.data?.archTrustDomain,
                    customIconUrl: sourceProvider === 'custom'
                        ? sourceNode?.data?.customIconUrl
                        : undefined,
                    archIconPackId: sourceProvider !== 'custom'
                        ? sourceNode?.data?.archIconPackId
                        : undefined,
                    archIconShapeId: sourceProvider !== 'custom'
                        ? sourceNode?.data?.archIconShapeId
                        : undefined,
                },
            },
            isGenericShape: false,
        };
    }

    return {
        newNode: createGenericShapeNode(id, position, {
            type,
            label: nodeContent.label,
            subLabel: nodeContent.subLabel,
            icon: isGenericShape
                ? undefined
                : defaultStyle?.icon && defaultStyle.icon !== 'none'
                    ? defaultStyle.icon
                    : nodeContent.icon,
            color: getGenericShapeColor(type, shape, defaultStyle?.color),
            shape: (shape || defaultStyle?.shape) as NodeData['shape'],
        }),
        isGenericShape,
    };
}

export function buildConnectedEdge(
    sourceId: string,
    targetId: string,
    sourceHandle: string | null,
    targetHandle: string | null,
    edgePreset?: ConnectedEdgePreset
): FlowEdge {
    return {
        id: `e-${sourceId}-${targetId}`,
        source: sourceId,
        sourceHandle,
        target: targetId,
        targetHandle,
        data: {
            connectionType: sourceHandle || targetHandle ? 'fixed' : 'dynamic',
            ...(edgePreset?.data ?? {}),
        },
        ...(edgePreset?.label ? { label: edgePreset.label } : {}),
        ...DEFAULT_EDGE_OPTIONS,
    };
}

interface ResolveConnectEndActionParams {
    nodes: FlowNode[];
    edges: FlowEdge[];
    sourceId: string;
    sourceHandle: string | null;
    position: { x: number; y: number };
    clientPosition: { x: number; y: number };
    targetIsPane: boolean;
    canvasInteractionsV1Enabled: boolean;
}

export function resolveConnectEndAction({
    nodes,
    edges,
    sourceId,
    sourceHandle,
    position,
    clientPosition,
    targetIsPane,
    canvasInteractionsV1Enabled,
}: ResolveConnectEndActionParams): ConnectEndResolution {
    const closestHandle = findClosestHandleTarget(nodes, position);

    if (closestHandle) {
        const connection: Connection = {
            source: sourceId,
            sourceHandle,
            target: closestHandle.nodeId,
            targetHandle: closestHandle.handleId,
        };

        if (isDuplicateConnection(edges, connection)) {
            return { type: 'none' };
        }

        return { type: 'connect', connection };
    }

    if (!targetIsPane) {
        return { type: 'none' };
    }

    const sourceNode = nodes.find((node) => node.id === sourceId);
    if (sourceNode?.data?.assetPresentation === 'icon') {
        return {
            type: 'menu',
            clientPosition,
            sourceType: sourceNode.type ?? null,
        };
    }

    if (canvasInteractionsV1Enabled) {
        const defaultConnectedNode = getDefaultConnectedNodeSpec(sourceNode?.type);
        return {
            type: 'add',
            nodeType: defaultConnectedNode.type,
            shape: defaultConnectedNode.shape,
            position,
        };
    }

    return {
        type: 'menu',
        clientPosition,
        sourceType: sourceNode?.type ?? null,
    };
}
