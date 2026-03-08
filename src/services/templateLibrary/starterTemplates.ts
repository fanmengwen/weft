import { createDefaultEdge } from '@/constants';
import { NodeType, type FlowNode } from '@/lib/types';
import { createTemplateRegistry, type TemplateRegistry } from './registry';
import type { TemplateManifest } from './types';

function createNode(
    id: string,
    type: NodeType,
    label: string,
    x: number,
    y: number,
    color: string,
    subLabel = '',
): FlowNode {
    return {
        id,
        type,
        position: { x, y },
        data: {
            label,
            subLabel,
            color,
        },
    };
}

const FLOWCHART_TEMPLATE: TemplateManifest = {
    id: 'starter-flowchart-checkout',
    name: 'Checkout Flow (Starter)',
    description: 'Baseline checkout decision flow template.',
    category: 'flowchart',
    tags: ['starter', 'flowchart', 'business'],
    graph: {
        nodes: [
            createNode('fc-1', NodeType.START, 'Session Start', 0, 0, 'blue'),
            createNode('fc-2', NodeType.PROCESS, 'Cart Review', 0, 160, 'slate'),
            createNode('fc-3', NodeType.DECISION, 'Payment Success?', 0, 320, 'amber'),
            createNode('fc-4', NodeType.END, 'Order Confirmed', 220, 480, 'emerald'),
            createNode('fc-5', NodeType.END, 'Retry Payment', -220, 480, 'red'),
        ],
        edges: [
            createDefaultEdge('fc-1', 'fc-2'),
            createDefaultEdge('fc-2', 'fc-3'),
            createDefaultEdge('fc-3', 'fc-4', 'Yes'),
            createDefaultEdge('fc-3', 'fc-5', 'No'),
        ],
    },
};

const ARCHITECTURE_TEMPLATE: TemplateManifest = {
    id: 'starter-architecture-api',
    name: 'API Platform (Starter)',
    description: 'Starter architecture flow with gateway, service, and storage tiers.',
    category: 'architecture',
    tags: ['starter', 'architecture', 'infra'],
    graph: {
        nodes: [
            createNode('arch-1', NodeType.ARCHITECTURE, 'API Gateway', 0, 0, 'blue', 'Ingress'),
            createNode('arch-2', NodeType.ARCHITECTURE, 'Auth Service', -220, 180, 'violet', 'Token'),
            createNode('arch-3', NodeType.ARCHITECTURE, 'Billing Service', 220, 180, 'emerald', 'Charge'),
            createNode('arch-4', NodeType.ARCHITECTURE, 'Primary DB', 0, 360, 'cyan', 'PostgreSQL'),
        ],
        edges: [
            createDefaultEdge('arch-1', 'arch-2'),
            createDefaultEdge('arch-1', 'arch-3'),
            createDefaultEdge('arch-2', 'arch-4'),
            createDefaultEdge('arch-3', 'arch-4'),
        ],
    },
};

export const STARTER_TEMPLATE_MANIFESTS: TemplateManifest[] = [FLOWCHART_TEMPLATE, ARCHITECTURE_TEMPLATE];

export function createStarterTemplateRegistry(): TemplateRegistry {
    return createTemplateRegistry(STARTER_TEMPLATE_MANIFESTS);
}
