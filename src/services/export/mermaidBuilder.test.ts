import { describe, expect, it } from 'vitest';
import { toMermaid } from './mermaidBuilder';
import type { FlowNode, FlowEdge } from '@/lib/types';
const node = (id: string, type: string, label: string, extra = {}): FlowNode =>
    ({ id, type, position: { x: 0, y: 0 }, data: { label, ...extra } } as FlowNode);
const edge = (id: string, source: string, target: string): FlowEdge =>
    ({ id, source, target } as FlowEdge);

describe('toMermaid', () => {
    it('flowchart — two process nodes with edge starts with flowchart TD and contains node IDs', () => {
        const result = toMermaid(
            [node('a', 'process', 'A'), node('b', 'process', 'B')],
            [edge('e1', 'a', 'b')]
        );
        expect(result).toMatch(/^flowchart TD/);
        expect(result).toContain('a');
        expect(result).toContain('b');
    });

    it('architecture — two architecture nodes starts with architecture-beta and contains service', () => {
        const result = toMermaid(
            [
                node('svc1', 'architecture', 'ServiceA', { archResourceType: 'service' }),
                node('svc2', 'architecture', 'ServiceB', { archResourceType: 'service' }),
            ],
            [edge('e1', 'svc1', 'svc2')]
        );
        expect(result).toMatch(/^architecture-beta/);
        expect(result).toContain('service');
    });

    it('empty — no nodes returns a string without throwing', () => {
        const result = toMermaid([], []);
        expect(typeof result).toBe('string');
    });

    it('node label sanitization — label with spaces is included in output', () => {
        const result = toMermaid(
            [node('n1', 'process', 'Hello World & More')],
            []
        );
        expect(result).toContain('Hello World');
    });
});
