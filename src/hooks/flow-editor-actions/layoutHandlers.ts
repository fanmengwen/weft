import type { FlowEdge, FlowNode } from '@/lib/types';
import type { FlowTemplate } from '@/services/templates';
import type { LayoutAlgorithm } from '@/services/elkLayout';
import { buildInsertedTemplateData } from './helpers';

interface FitViewOptions {
    duration?: number;
    padding?: number;
    minZoom?: number;
    maxZoom?: number;
}

interface FitViewLike {
    (options?: FitViewOptions): void;
}

interface AutoLayoutParams {
    nodes: FlowNode[];
    edges: FlowEdge[];
    direction?: 'TB' | 'LR' | 'RL' | 'BT';
    algorithm?: LayoutAlgorithm;
    spacing?: 'compact' | 'normal' | 'loose';
    diagramType?: string;
}

interface AutoLayoutResult {
    nodes: FlowNode[];
    edges: FlowEdge[];
}

interface InsertTemplateParams {
    template: FlowTemplate;
    existingNodes: FlowNode[];
}

interface InsertedTemplateResult {
    nextNodes: FlowNode[];
    newEdges: FlowEdge[];
}

function getLayoutHintsForDiagramType(diagramType: string | undefined): Partial<Pick<AutoLayoutParams, 'algorithm' | 'direction'>> {
    switch (diagramType) {
        case 'architecture':
        case 'infrastructure':
            return { direction: 'LR' };
        case 'org-chart':
            return { algorithm: 'mrtree', direction: 'TB' };
        default:
            return {};
    }
}

export async function getAutoLayoutResult({
    nodes,
    edges,
    direction,
    algorithm,
    spacing = 'normal',
    diagramType,
}: AutoLayoutParams): Promise<AutoLayoutResult> {
    const hints = getLayoutHintsForDiagramType(diagramType);
    const { getElkLayout } = await import('@/services/elkLayout');
    return getElkLayout(nodes, edges, {
        direction: direction ?? hints.direction ?? 'TB',
        algorithm: algorithm ?? hints.algorithm ?? 'layered',
        spacing,
        diagramType,
    });
}

export function buildTemplateInsertionResult({
    template,
    existingNodes,
}: InsertTemplateParams): InsertedTemplateResult {
    const { newNodes, newEdges } = buildInsertedTemplateData(template, existingNodes);
    return {
        nextNodes: [
            ...existingNodes.map((node) => ({ ...node, selected: false })),
            ...newNodes,
        ],
        newEdges,
    };
}

export function scheduleFitView(
    fitView: FitViewLike,
    duration: number,
    delayMs: number,
    options: Omit<FitViewOptions, 'duration'> = {},
): void {
    window.setTimeout(() => fitView({ duration, ...options }), delayMs);
}

/** Fit content into view without changing the current zoom level (pan only). */
export function scheduleFitViewPreservingZoom(
    fitView: FitViewLike,
    getZoom: () => number,
    duration: number,
    delayMs: number,
): void {
    const zoom = getZoom();
    scheduleFitView(fitView, duration, delayMs, { minZoom: zoom, maxZoom: zoom });
}
