import type { FlowNode, NodeData } from '@/lib/types';
import { clearNodeParent, getNodeParentId, setNodeParent } from '@/lib/nodeParent';
import { NODE_DEFAULTS } from '@/theme';

export function getDefaultNodePosition(count: number, baseX: number, baseY: number): { x: number; y: number } {
    const columns = 4;
    const column = count % columns;
    const row = Math.floor(count / columns);
    return { x: baseX + column * 80, y: baseY + row * 80 };
}

export function createProcessNode(
    id: string,
    position: { x: number; y: number },
    labels: { label: string; subLabel: string }
): FlowNode {
    const defaults = NODE_DEFAULTS.process;
    return {
        id,
        position,
        data: {
            label: labels.label,
            subLabel: labels.subLabel,
            color: defaults?.color || 'slate',
            shape: defaults?.shape as NodeData['shape'],
            icon: defaults?.icon && defaults.icon !== 'none' ? defaults.icon : undefined,
        },
        type: 'process',
        width: 200,
        height: 80,
    };
}

export function createAnnotationNode(
    id: string,
    position: { x: number; y: number },
    labels: { label: string; subLabel: string }
): FlowNode {
    return {
        id,
        position,
        data: { label: labels.label, subLabel: labels.subLabel, color: 'yellow' },
        type: 'annotation',
    };
}

export function createSectionNode(
    id: string,
    position: { x: number; y: number },
    label: string
): FlowNode {
    return {
        id,
        position,
        data: { label, subLabel: '', color: 'blue' },
        type: 'section',
        style: { width: 500, height: 400 },
        zIndex: -1,
    };
}

export function createTextNode(
    id: string,
    position: { x: number; y: number },
    label: string
): FlowNode {
    return {
        id,
        position,
        data: { label, subLabel: '', color: 'slate' },
        type: 'text',
    };
}

export function createImageNode(
    id: string,
    imageUrl: string,
    position: { x: number; y: number },
    label: string
): FlowNode {
    return {
        id,
        position,
        data: { label, imageUrl, transparency: 1, rotation: 0 },
        type: 'image',
        style: { width: 200, height: 200 },
    };
}

function getAbsoluteNodePosition(node: FlowNode, allNodes: FlowNode[]): { x: number; y: number } {
    const parentId = getNodeParentId(node);
    if (!parentId) {
        return { ...node.position };
    }
    const parent = allNodes.find((candidate) => candidate.id === parentId);
    if (!parent) {
        return { ...node.position };
    }
    return {
        x: node.position.x + parent.position.x,
        y: node.position.y + parent.position.y,
    };
}

function findContainingSection(
    position: { x: number; y: number },
    draggedNodeId: string,
    allNodes: FlowNode[]
): FlowNode | null {
    const sectionNodes = allNodes.filter((node) => node.type === 'section' && node.id !== draggedNodeId);

    for (const section of sectionNodes) {
        const sectionWidth = (section.style?.width as number) || 500;
        const sectionHeight = (section.style?.height as number) || 400;
        const sectionX = section.position.x;
        const sectionY = section.position.y;

        if (
            position.x > sectionX
            && position.x < sectionX + sectionWidth
            && position.y > sectionY
            && position.y < sectionY + sectionHeight
        ) {
            return section;
        }
    }

    return null;
}

function unparentNode(node: FlowNode, absolutePosition: { x: number; y: number }): FlowNode {
    return clearNodeParent({ ...node, position: absolutePosition });
}

export function applySectionParenting(currentNodes: FlowNode[], draggedNode: FlowNode): FlowNode[] {
    if (draggedNode.type === 'section') {
        return currentNodes;
    }

    const absolutePosition = getAbsoluteNodePosition(draggedNode, currentNodes);
    const newParent = findContainingSection(absolutePosition, draggedNode.id, currentNodes);
    if (newParent?.id === getNodeParentId(draggedNode)) {
        return currentNodes;
    }

    return currentNodes.map((node) => {
        if (node.id !== draggedNode.id) {
            return node;
        }

        if (newParent) {
            return setNodeParent({
                ...node,
                position: {
                    x: absolutePosition.x - newParent.position.x,
                    y: absolutePosition.y - newParent.position.y,
                },
            }, newParent.id);
        }

        if (getNodeParentId(node)) {
            return unparentNode(node, absolutePosition);
        }

        return { ...node, position: draggedNode.position };
    });
}
