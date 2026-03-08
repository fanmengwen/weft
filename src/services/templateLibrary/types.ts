import type { FlowEdge, FlowNode } from '@/lib/types';

export interface TemplateGraphSnapshot {
    nodes: FlowNode[];
    edges: FlowEdge[];
}

export interface TemplateManifest {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    graph: TemplateGraphSnapshot;
}
