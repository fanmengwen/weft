import { getBezierPath, getSmoothStepPath, Position } from '@/lib/reactflowCompat';

interface MinimalEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
}

interface EdgePathParams {
    id: string;
    source: string;
    target: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    sourcePosition: Position;
    targetPosition: Position;
    sourceHandleId?: string | null;
    targetHandleId?: string | null;
}

type EdgeVariant = 'bezier' | 'smoothstep' | 'step';
type LoopDirection = 'right' | 'top' | 'left' | 'bottom';

interface EdgePathOptions {
    forceOrthogonal?: boolean;
    waypoint?: {
        x: number;
        y: number;
    };
}

interface SelfLoopResult {
    path: string;
    labelX: number;
    labelY: number;
}

interface EdgePathResult {
    edgePath: string;
    labelX: number;
    labelY: number;
}

function withBundledLabelOffset(
    edgePath: string,
    labelX: number,
    labelY: number,
    params: Pick<EdgePathParams, 'sourcePosition' | 'targetPosition'>,
    bundleOffset: number
): EdgePathResult {
    const nudgedLabel = nudgeLabelByBundleOffset({ x: labelX, y: labelY }, params, bundleOffset);
    return { edgePath, labelX: nudgedLabel.x, labelY: nudgedLabel.y };
}

function getAdaptiveFanoutSpacing(siblingCount: number): number {
    if (siblingCount <= 1) return 0;
    return Math.min(22, 12 + Math.max(0, siblingCount - 2) * 2);
}

function getParallelEdgeOffset(edgeId: string, source: string, target: string, allEdges: MinimalEdge[]): number {
    const keyA = `${source}-${target}`;
    const keyB = `${target}-${source}`;
    const siblings = allEdges.filter((edge) => {
        const edgeKey = `${edge.source}-${edge.target}`;
        return edgeKey === keyA || edgeKey === keyB;
    });
    if (siblings.length <= 1) return 0;

    const index = siblings.findIndex((edge) => edge.id === edgeId);
    const spacing = 25;
    return (index - (siblings.length - 1) / 2) * spacing;
}

function getEndpointFanoutOffset(
    edgeId: string,
    allEdges: MinimalEdge[],
    endpoint: { nodeId: string; handleId?: string | null; direction: 'source' | 'target' }
): number {
    const handleId = endpoint.handleId ?? null;
    const siblings = allEdges.filter((edge) => {
        if (endpoint.direction === 'source') {
            return edge.source === endpoint.nodeId && (edge.sourceHandle ?? null) === handleId;
        }

        return edge.target === endpoint.nodeId && (edge.targetHandle ?? null) === handleId;
    });

    if (siblings.length <= 1) return 0;

    const index = siblings.findIndex((edge) => edge.id === edgeId);
    if (index === -1) return 0;

    const spacing = getAdaptiveFanoutSpacing(siblings.length);
    return (index - (siblings.length - 1) / 2) * spacing;
}

function getSelfLoopPath(
    sourceX: number,
    sourceY: number,
    nodeWidth = 180,
    nodeHeight = 60,
    loopDirection: LoopDirection = 'right'
): SelfLoopResult {
    const size = Math.max(nodeWidth, nodeHeight) * 0.5;
    const offset = size * 0.8;

    switch (loopDirection) {
        case 'top':
            return {
                path: `M ${sourceX - 15} ${sourceY} C ${sourceX - offset} ${sourceY - size * 1.5}, ${sourceX + offset} ${sourceY - size * 1.5}, ${sourceX + 15} ${sourceY}`,
                labelX: sourceX,
                labelY: sourceY - size * 1.2,
            };
        case 'left':
            return {
                path: `M ${sourceX} ${sourceY - 15} C ${sourceX - size * 1.5} ${sourceY - offset}, ${sourceX - size * 1.5} ${sourceY + offset}, ${sourceX} ${sourceY + 15}`,
                labelX: sourceX - size * 1.2,
                labelY: sourceY,
            };
        case 'bottom':
            return {
                path: `M ${sourceX - 15} ${sourceY} C ${sourceX - offset} ${sourceY + size * 1.5}, ${sourceX + offset} ${sourceY + size * 1.5}, ${sourceX + 15} ${sourceY}`,
                labelX: sourceX,
                labelY: sourceY + size * 1.2,
            };
        case 'right':
        default:
            return {
                path: `M ${sourceX} ${sourceY - 15} C ${sourceX + size * 1.5} ${sourceY - offset}, ${sourceX + size * 1.5} ${sourceY + offset}, ${sourceX} ${sourceY + 15}`,
                labelX: sourceX + size * 1.2,
                labelY: sourceY,
            };
    }
}

function getOffsetVector(position: Position, offset: number): { x: number; y: number } {
    switch (position) {
        case Position.Top:
        case Position.Bottom:
            return { x: offset, y: 0 };
        case Position.Left:
        case Position.Right:
            return { x: 0, y: offset };
        default:
            return { x: 0, y: 0 };
    }
}

function getLoopDirection(position: Position): LoopDirection {
    switch (position) {
        case Position.Top:
            return 'top';
        case Position.Left:
            return 'left';
        case Position.Bottom:
            return 'bottom';
        case Position.Right:
        default:
            return 'right';
    }
}

function nudgeLabelByBundleOffset(
    label: { x: number; y: number },
    params: Pick<EdgePathParams, 'sourcePosition' | 'targetPosition'>,
    bundleOffset: number
): { x: number; y: number } {
    if (bundleOffset === 0) return label;

    const labelNudge = bundleOffset * 0.7;
    const usesVerticalSpread =
        params.sourcePosition === Position.Left
        || params.sourcePosition === Position.Right
        || params.targetPosition === Position.Left
        || params.targetPosition === Position.Right;

    return usesVerticalSpread
        ? { x: label.x, y: label.y + labelNudge }
        : { x: label.x + labelNudge, y: label.y };
}

export function buildEdgePath(
    params: EdgePathParams,
    allEdges: MinimalEdge[],
    variant: EdgeVariant,
    options: EdgePathOptions = {}
): EdgePathResult {
    if (params.source === params.target) {
        const loop = getSelfLoopPath(
            params.sourceX,
            params.sourceY,
            180,
            60,
            getLoopDirection(params.sourcePosition)
        );
        return { edgePath: loop.path, labelX: loop.labelX, labelY: loop.labelY };
    }

    const pairOffset = getParallelEdgeOffset(params.id, params.source, params.target, allEdges);
    const sourceFanoutOffset = getEndpointFanoutOffset(params.id, allEdges, {
        nodeId: params.source,
        handleId: params.sourceHandleId,
        direction: 'source',
    });
    const targetFanoutOffset = getEndpointFanoutOffset(params.id, allEdges, {
        nodeId: params.target,
        handleId: params.targetHandleId,
        direction: 'target',
    });
    const sourceOffset = getOffsetVector(params.sourcePosition, pairOffset + sourceFanoutOffset);
    const targetOffset = getOffsetVector(params.targetPosition, pairOffset + targetFanoutOffset);
    const labelBundleOffset = pairOffset + (sourceFanoutOffset + targetFanoutOffset) / 2;
    const sourceX = params.sourceX + sourceOffset.x;
    const sourceY = params.sourceY + sourceOffset.y;
    const targetX = params.targetX + targetOffset.x;
    const targetY = params.targetY + targetOffset.y;

    if (options.waypoint) {
        const waypoint = options.waypoint;
        const firstSegmentLength = Math.hypot(waypoint.x - sourceX, waypoint.y - sourceY);
        const secondSegmentLength = Math.hypot(targetX - waypoint.x, targetY - waypoint.y);
        const totalLength = firstSegmentLength + secondSegmentLength;
        const midpointLength = totalLength / 2;

        let labelX = waypoint.x;
        let labelY = waypoint.y;
        if (midpointLength <= firstSegmentLength && firstSegmentLength > 0) {
            const ratio = midpointLength / firstSegmentLength;
            labelX = sourceX + (waypoint.x - sourceX) * ratio;
            labelY = sourceY + (waypoint.y - sourceY) * ratio;
        } else if (secondSegmentLength > 0) {
            const ratio = (midpointLength - firstSegmentLength) / secondSegmentLength;
            labelX = waypoint.x + (targetX - waypoint.x) * ratio;
            labelY = waypoint.y + (targetY - waypoint.y) * ratio;
        }

        return withBundledLabelOffset(
            `M ${sourceX} ${sourceY} L ${waypoint.x} ${waypoint.y} L ${targetX} ${targetY}`,
            labelX,
            labelY,
            params,
            labelBundleOffset
        );
    }

    if (variant === 'bezier' && !options.forceOrthogonal) {
        const [edgePath, labelX, labelY] = getBezierPath({
            sourceX,
            sourceY,
            sourcePosition: params.sourcePosition,
            targetX,
            targetY,
            targetPosition: params.targetPosition,
            curvature: 0.25,
        });
        return withBundledLabelOffset(edgePath, labelX, labelY, params, labelBundleOffset);
    }

    if (variant === 'step') {
        const [edgePath, labelX, labelY] = getSmoothStepPath({
            sourceX,
            sourceY,
            sourcePosition: params.sourcePosition,
            targetX,
            targetY,
            targetPosition: params.targetPosition,
            borderRadius: 0,
            offset: 20,
        });
        return withBundledLabelOffset(edgePath, labelX, labelY, params, labelBundleOffset);
    }

    if (options.forceOrthogonal) {
        const [edgePath, labelX, labelY] = getSmoothStepPath({
            sourceX,
            sourceY,
            sourcePosition: params.sourcePosition,
            targetX,
            targetY,
            targetPosition: params.targetPosition,
            borderRadius: 0,
            offset: 20,
        });
        return withBundledLabelOffset(edgePath, labelX, labelY, params, labelBundleOffset);
    }

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition: params.sourcePosition,
        targetX,
        targetY,
        targetPosition: params.targetPosition,
        offset: 20,
    });
    return withBundledLabelOffset(edgePath, labelX, labelY, params, labelBundleOffset);
}
