import {
    BackgroundVariant,
    ConnectionMode,
    MarkerType,
    PanOnScrollMode,
    SelectionMode,
    type KeyCode,
} from '@/lib/reactflowCompat';

export const FLOW_CANVAS_BASE_BEHAVIOR: {
    connectionMode: ConnectionMode;
    selectNodesOnDrag: boolean;
    selectionKeyCode: KeyCode | null;
    panActivationKeyCode: KeyCode | null;
    zoomActivationKeyCode: KeyCode | null;
    multiSelectionKeyCode: string;
    zoomOnScroll: boolean;
    zoomOnPinch: boolean;
    panOnScroll: boolean;
    panOnScrollMode: PanOnScrollMode;
    preventScrolling: boolean;
    zoomOnDoubleClick: boolean;
} = {
    connectionMode: ConnectionMode.Loose,
    selectNodesOnDrag: false,
    selectionKeyCode: 'Shift',
    panActivationKeyCode: 'Space',
    zoomActivationKeyCode: ['Meta', 'Control'],
    multiSelectionKeyCode: 'Shift',
    zoomOnScroll: false,
    zoomOnPinch: true,
    panOnScroll: true,
    panOnScrollMode: PanOnScrollMode.Free,
    preventScrolling: true,
    zoomOnDoubleClick: false,
};

/** Chart canvas surface tokens from Canvas.dc.html (#F6F7F9 + #DEE1E7 dots @ 22px). */
export const FLOW_CANVAS_DOT_GAP = 22;
/** Hex required: SVG pattern fill does not resolve CSS variables reliably. */
export const FLOW_CANVAS_DOT_COLOR = '#dee1e7';
export const FLOW_CANVAS_BG_COLOR = '#f6f7f9';
export const FLOW_CANVAS_EDGE_STROKE = 'var(--wf-edge)';

export const FLOW_CANVAS_STYLE_PRESETS = {
    enhanced: {
        defaultEdgeOptions: {
            style: { stroke: FLOW_CANVAS_EDGE_STROKE, strokeWidth: 1.6 },
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed, color: FLOW_CANVAS_EDGE_STROKE, width: 20, height: 20 },
        },
        background: {
            variant: BackgroundVariant.Dots,
            gap: FLOW_CANVAS_DOT_GAP,
            size: 1,
            color: FLOW_CANVAS_DOT_COLOR,
        },
    },
    standard: {
        defaultEdgeOptions: {
            style: { stroke: FLOW_CANVAS_EDGE_STROKE, strokeWidth: 2 },
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed, color: FLOW_CANVAS_EDGE_STROKE, width: 20, height: 20 },
        },
        background: {
            variant: BackgroundVariant.Dots,
            gap: FLOW_CANVAS_DOT_GAP,
            size: 1,
            color: FLOW_CANVAS_DOT_COLOR,
        },
    },
} as const;

export function getFlowCanvasClassName(
    isEffectiveSelectMode: boolean,
    showGrid = true
): string {
    // Canvas.dc.html: #F6F7F9 + radial #DEE1E7 dots @ 22px (see .flow-canvas-grid in index.css).
    const modeClass = isEffectiveSelectMode ? 'flow-canvas-select-mode' : 'flow-canvas-pan-mode';
    const gridClass = showGrid ? 'flow-canvas-grid' : '';
    return ['flow-canvas-surface', modeClass, gridClass].filter(Boolean).join(' ');
}

export function getFlowCanvasInteractionMode(isEffectiveSelectMode: boolean): {
    selectionOnDrag: boolean;
    panOnDrag: boolean | number[];
    selectionMode: SelectionMode | undefined;
} {
    if (isEffectiveSelectMode) {
        return {
            selectionOnDrag: true,
            panOnDrag: [1, 2],
            selectionMode: SelectionMode.Partial,
        };
    }

    return {
        selectionOnDrag: false,
        panOnDrag: [0, 1, 2],
        selectionMode: undefined,
    };
}
