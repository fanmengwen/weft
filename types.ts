import { Edge, Node } from 'reactflow';

export enum NodeType {
  START = 'start',
  PROCESS = 'process',
  DECISION = 'decision',
  END = 'end',
  CUSTOM = 'custom',
  ANNOTATION = 'annotation',
  SECTION = 'section'
}

export interface NodeData {
  label: string;
  subLabel?: string; // Supports Markdown
  icon?: string; // Key for the icon map
  imageUrl?: string; // Base64 or URL
  color?: string; // Tailwind color class key (e.g., 'blue', 'red')
  align?: 'left' | 'center' | 'right';
  shape?: 'rectangle' | 'rounded' | 'capsule';
  rotation?: number; // New Rotation Property
  width?: number;
  height?: number;
}

export interface AIRequestParams {
  prompt: string;
  apiKey: string;
}

export type FlowNode = Node<NodeData>;
export type FlowEdge = Edge;

export interface GeneratedFlowData {
  nodes: {
    id: string;
    type: string;
    label: string;
    description?: string;
    x: number;
    y: number;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    label?: string;
  }[];
}

export interface FlowHistoryState {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowTab {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  history: {
    past: FlowHistoryState[];
    future: FlowHistoryState[];
  };
}

export type EdgeCondition = 'default' | 'yes' | 'no' | 'success' | 'error' | 'timeout';

export interface FlowSnapshot {
  id: string;
  name: string;
  timestamp: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}