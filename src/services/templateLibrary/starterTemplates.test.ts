import { describe, expect, it } from 'vitest';
import { createStarterTemplateRegistry, STARTER_TEMPLATE_MANIFESTS } from './starterTemplates';

describe('starter template manifests', () => {
    it('includes flowchart and architecture starter templates', () => {
        const ids = STARTER_TEMPLATE_MANIFESTS.map((template) => template.id);

        expect(ids).toEqual(['starter-flowchart-checkout', 'starter-architecture-api']);
    });

    it('has deterministic graph integrity for every starter template', () => {
        STARTER_TEMPLATE_MANIFESTS.forEach((template) => {
            const nodeIds = new Set(template.graph.nodes.map((node) => node.id));
            const edgeIds = new Set(template.graph.edges.map((edge) => edge.id));

            expect(nodeIds.size).toBe(template.graph.nodes.length);
            expect(edgeIds.size).toBe(template.graph.edges.length);

            template.graph.edges.forEach((edge) => {
                expect(nodeIds.has(edge.source)).toBe(true);
                expect(nodeIds.has(edge.target)).toBe(true);
            });
        });
    });

    it('is consumable by template registry scaffold', () => {
        const registry = createStarterTemplateRegistry();

        expect(registry.listTemplates()).toHaveLength(2);
        expect(registry.getTemplate('starter-flowchart-checkout')?.graph.nodes).toHaveLength(5);
        expect(registry.getTemplate('starter-architecture-api')?.graph.nodes).toHaveLength(4);
    });
});
