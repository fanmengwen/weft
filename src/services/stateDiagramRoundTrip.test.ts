import { describe, expect, it } from 'vitest';
import { parseMermaidByType } from '@/services/mermaid/parseMermaidByType';
import { toMermaid } from './exportService';

describe('stateDiagram round-trip', () => {
  it('preserves family and transition labels through parse/export/parse', () => {
    const source = `
      stateDiagram-v2
      [*] --> Idle
      Idle --> Running : start
      Running --> [*]
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('stateDiagram');
    expect(first.nodes.length).toBeGreaterThan(0);
    expect(first.edges).toHaveLength(3);

    const exported = toMermaid(first.nodes, first.edges);
    expect(exported.startsWith('stateDiagram-v2')).toBe(true);
    expect(exported).toContain('Idle --> Running : start');

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('stateDiagram');
    expect(second.edges).toHaveLength(first.edges.length);
    expect(second.edges.some((edge) => edge.label === 'start')).toBe(true);
  });

  it('preserves composite-state parenting through parse/export/parse', () => {
    const source = `
      stateDiagram-v2
      state Working {
        [*] --> Busy
        Busy --> Idle
      }
      Idle --> [*]
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('stateDiagram');

    const exported = toMermaid(first.nodes, first.edges);
    expect(exported).toContain('state Working {');

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('stateDiagram');
    const busyNode = second.nodes.find((node) => node.id === 'Busy');
    expect(busyNode?.parentId).toBe('Working');
  });
});
