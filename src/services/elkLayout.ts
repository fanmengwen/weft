import type { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled.js';
import { NODE_HEIGHT, NODE_WIDTH } from '@/constants';
import type { FlowEdge, FlowNode } from '@/lib/types';
import { normalizeLayoutInputsForDeterminism } from './elk-layout/determinism';
import { buildResolvedLayoutConfiguration, getDeterministicSeedOptions, resolveLayoutPresetOptions } from './elk-layout/options';
import type { FlowNodeWithMeasuredDimensions, LayoutAlgorithm, LayoutDirection, LayoutOptions } from './elk-layout/types';

interface ElkLayoutEngine {
    layout: (graph: ElkNode) => Promise<ElkNode>;
}

let elkInstancePromise: Promise<ElkLayoutEngine> | null = null;

async function getElkInstance(): Promise<ElkLayoutEngine> {
    if (!elkInstancePromise) {
        elkInstancePromise = import('elkjs/lib/elk.bundled.js').then((module) => {
            return new module.default() as unknown as ElkLayoutEngine;
        });
    }
    return elkInstancePromise;
}

function buildElkNode(
    node: FlowNode,
    childrenByParent: Map<string, FlowNode[]>
): ElkNode {
    const children = childrenByParent.get(node.id) || [];

    const nodeWithMeasuredDimensions = node as FlowNodeWithMeasuredDimensions;
    let width = nodeWithMeasuredDimensions.measured?.width ?? node.width ?? nodeWithMeasuredDimensions.data?.width;
    let height = nodeWithMeasuredDimensions.measured?.height ?? node.height ?? nodeWithMeasuredDimensions.data?.height;

    if (!width || !height) {
        const label = node.data?.label || '';
        const estimatedWidth = Math.max(NODE_WIDTH, label.length * 8 + 40);
        const estimatedHeight = Math.max(NODE_HEIGHT, Math.ceil(label.length / 40) * 20 + 60);

        width = width ?? estimatedWidth;
        height = height ?? estimatedHeight;
    }

    return {
        id: node.id,
        width: children.length === 0 ? width : undefined,
        height: children.length === 0 ? height : undefined,
        children: children.map((child) => buildElkNode(child, childrenByParent)),
        layoutOptions: {
            'elk.portConstraints': 'FREE',
            'elk.padding': '[top=40,left=20,bottom=20,right=20]',
        },
    };
}

function buildPositionMap(layoutResult: ElkNode): Map<string, { x: number; y: number; width?: number; height?: number }> {
    const positionMap = new Map<string, { x: number; y: number; width?: number; height?: number }>();

    function traverse(node: ElkNode): void {
        if (node.id !== 'root') {
            positionMap.set(node.id, {
                x: node.x ?? 0,
                y: node.y ?? 0,
                width: node.width,
                height: node.height,
            });
        }
        node.children?.forEach(traverse);
    }

    traverse(layoutResult);
    return positionMap;
}

export type { LayoutAlgorithm, LayoutDirection, LayoutOptions } from './elk-layout/types';
export { buildResolvedLayoutConfiguration, getDeterministicSeedOptions, normalizeLayoutInputsForDeterminism, resolveLayoutPresetOptions };

export async function getElkLayout(
    nodes: FlowNode[],
    edges: FlowEdge[],
    options: LayoutOptions = {}
): Promise<FlowNode[]> {
    const { layoutOptions } = buildResolvedLayoutConfiguration(options);
    const { topLevelNodes, childrenByParent, sortedEdges } = normalizeLayoutInputsForDeterminism(nodes, edges);

    const elkGraph: ElkNode = {
        id: 'root',
        layoutOptions,
        children: topLevelNodes.map((node) => buildElkNode(node, childrenByParent)),
        edges: sortedEdges.map((edge) => ({
            id: edge.id,
            sources: [edge.source],
            targets: [edge.target],
        })) as ElkExtendedEdge[],
    };

    try {
        const elk = await getElkInstance();
        const layoutResult = await elk.layout(elkGraph);
        const positionMap = buildPositionMap(layoutResult);

        return nodes.map((node) => {
            const position = positionMap.get(node.id);
            if (!position) return node;

            const style = { ...node.style };
            if (node.type === 'group' || node.type === 'section' || node.type === 'container') {
                if (position.width) style.width = position.width;
                if (position.height) style.height = position.height;
            }

            return {
                ...node,
                position: { x: position.x, y: position.y },
                style,
            };
        });
    } catch (err) {
        console.error('ELK Layout Error:', err);
        return nodes;
    }
}
