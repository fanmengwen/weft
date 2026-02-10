import { Edge, Node } from 'reactflow';
import { NodeType } from './types';

// --- Edge Styles (inline for reliable SVG rendering) ---
export const EDGE_STYLE = { stroke: '#94a3b8', strokeWidth: 2 };
export const EDGE_LABEL_STYLE = { fill: '#334155', fontWeight: 500, fontSize: 12 };
export const EDGE_LABEL_BG_STYLE = { fill: '#ffffff', stroke: '#cbd5e1', strokeWidth: 1 };

export const EDGE_CONDITION_STYLES = {
  default: { stroke: '#94a3b8', strokeWidth: 2 },
  yes: { stroke: '#10b981', strokeWidth: 2 },
  no: { stroke: '#ef4444', strokeWidth: 2 },
  success: { stroke: '#10b981', strokeWidth: 2 },
  error: { stroke: '#ef4444', strokeWidth: 2 },
  timeout: { stroke: '#f59e0b', strokeWidth: 2 },
};

export const EDGE_CONDITION_LABELS = {
  yes: 'Yes',
  no: 'No',
  success: 'Success',
  error: 'Error',
  timeout: 'Timeout',
};

// --- Layout ---
export const NODE_WIDTH = 250;
export const NODE_HEIGHT = 150;

// --- Initial Data ---
export const INITIAL_NODES: Node[] = [
  {
    id: '1',
    type: NodeType.START,
    data: { label: 'Start Flow', subLabel: 'Entry point', icon: 'Play', color: 'emerald' },
    position: { x: 250, y: 0 },
  },
  {
    id: '2',
    type: NodeType.PROCESS,
    data: { label: 'User Action', subLabel: 'Waiting for input', icon: 'User', color: 'blue' },
    position: { x: 250, y: 200 },
  },
];

export const INITIAL_EDGES: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    type: 'smoothstep',
    label: 'Start',
    style: EDGE_STYLE,
    labelStyle: EDGE_LABEL_STYLE,
    labelBgStyle: EDGE_LABEL_BG_STYLE,
    labelBgPadding: [8, 4] as [number, number],
    labelBgBorderRadius: 4,
  },
];
