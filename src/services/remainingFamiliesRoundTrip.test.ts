import { describe, expect, it } from 'vitest';
import { parseMermaidByType } from '@/services/mermaid/parseMermaidByType';
import { toMermaid } from './exportService';

describe('remaining Mermaid family round-trip', () => {
  it('preserves journey family through parse/export/parse', () => {
    const source = `
      journey
      title Checkout
      section Happy Path
      Visit catalog: 5: Buyer
      Add to cart: 4: Buyer
      section Payment
      Pay: 3: Buyer
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('journey');
    expect(first.nodes.length).toBeGreaterThan(0);

    const exported = toMermaid(first.nodes, first.edges);
    expect(exported.startsWith('journey')).toBe(true);
    expect(exported).toContain('title Checkout');

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('journey');
    expect(second.nodes).toHaveLength(first.nodes.length);
    expect(second.edges).toHaveLength(first.edges.length);
    expect(second.nodes[0].data.journeyTitle).toBe('Checkout');
  });

  it('preserves journey steps with colon-rich task and actor text through parse/export/parse', () => {
    const source = `
      journey
      title Incident Response
      section Alerts
      HTTP: 500 Error: 1: SRE: On-call
      Recover service: 4: API: Team
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('journey');
    expect(first.nodes[0].data.journeyTask).toBe('HTTP: 500 Error');
    expect(first.nodes[0].data.journeyActor).toBe('SRE: On-call');

    const exported = toMermaid(first.nodes, first.edges);
    expect(exported.startsWith('journey')).toBe(true);
    expect(exported).toContain('HTTP: 500 Error: 1: SRE: On-call');
    expect(exported).toContain('Recover service: 4: API: Team');

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('journey');
    expect(second.nodes[0].data.journeyTask).toBe('HTTP: 500 Error');
    expect(second.nodes[0].data.journeyActor).toBe('SRE: On-call');
    expect(second.nodes[1].data.journeyActor).toBe('API: Team');
  });

  it('preserves sequence notes and aliases through parse/export/parse', () => {
    const source = `
      sequenceDiagram
      actor U as User
      participant API as Backend API
      note over U, API: warm path
      U->>API: Request
      API-->>U: Response
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('sequence');
    expect(first.nodes.some((node) => node.type === 'sequence_note')).toBe(true);

    const exported = toMermaid(first.nodes, first.edges);
    expect(exported.startsWith('sequenceDiagram')).toBe(true);
    expect(exported).toContain('actor U as User');
    expect(exported).toContain('participant API as Backend API');
    expect(exported).toContain('note over U, API: warm path');

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('sequence');
    const noteNode = second.nodes.find((node) => node.type === 'sequence_note');
    expect(noteNode?.data.seqNoteTargets).toEqual(['U', 'API']);
    expect(second.edges).toHaveLength(first.edges.length);
  });

  it('preserves sequence activation commands through parse/export/parse', () => {
    const source = `
      sequenceDiagram
      participant A
      participant B
      A->>B: Request
      activate B
      B-->>A: Response
      deactivate B
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('sequence');

    const exported = toMermaid(first.nodes, first.edges);
    expect(exported).toContain('activate B');
    expect(exported).toContain('deactivate B');

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('sequence');
    expect(second.nodes.find((node) => node.id === 'B')?.data.seqActivations).toEqual([
      { order: 1, activate: true },
      { order: 2, activate: false },
    ]);
  });

  it('preserves sequence alt/else branches through parse/export/parse', () => {
    const source = `
      sequenceDiagram
      participant A
      participant B
      alt success
        A->>B: Request
      else failure
        B-->>A: Error
      end
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('sequence');

    const exported = toMermaid(first.nodes, first.edges);
    expect(exported).toContain('alt success');
    expect(exported).toContain('else failure');
    expect(exported).not.toContain('alt failure');

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('sequence');
    expect(second.edges[0].data?.seqFragment).toMatchObject({
      type: 'alt',
      condition: 'success',
      branchKind: 'start',
    });
    expect(second.edges[1].data?.seqFragment).toMatchObject({
      type: 'alt',
      condition: 'failure',
      branchKind: 'else',
    });
  });

  it('preserves sequence par/and branches through parse/export/parse', () => {
    const source = `
      sequenceDiagram
      participant A
      participant B
      participant C
      par fast lane
        A->>B: Request
      and slow lane
        A->>C: Request
      end
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('sequence');

    const exported = toMermaid(first.nodes, first.edges);
    expect(exported).toContain('par fast lane');
    expect(exported).toContain('and slow lane');
    expect(exported).not.toContain('par slow lane');

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('sequence');
    expect(second.edges[0].data?.seqFragment).toMatchObject({
      type: 'par',
      condition: 'fast lane',
      branchKind: 'start',
    });
    expect(second.edges[1].data?.seqFragment).toMatchObject({
      type: 'par',
      condition: 'slow lane',
      branchKind: 'and',
    });
  });

  it('preserves sequence notes inside fragment blocks through parse/export/parse', () => {
    const source = `
      sequenceDiagram
      participant A
      participant B
      alt success
        note over A, B: Shared context
        A->>B: Request
      else failure
        B-->>A: Error
      end
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('sequence');
    expect(first.nodes.find((node) => node.type === 'sequence_note')?.data.seqFragment).toMatchObject({
      type: 'alt',
      condition: 'success',
      branchKind: 'start',
    });

    const exported = toMermaid(first.nodes, first.edges);
    expect(exported).toContain('alt success');
    expect(exported).toContain('note over A, B: Shared context');
    expect(exported).toContain('else failure');

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('sequence');
    expect(second.nodes.find((node) => node.type === 'sequence_note')?.data.seqFragment).toMatchObject({
      type: 'alt',
      condition: 'success',
      branchKind: 'start',
    });
  });

  it('preserves sequence critical/option branches through parse/export/parse', () => {
    const source = `
      sequenceDiagram
      participant A
      participant B
      critical primary path
        A->>B: Request
      option fallback path
        B-->>A: Error
      end
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('sequence');

    const exported = toMermaid(first.nodes, first.edges);
    expect(exported).toContain('critical primary path');
    expect(exported).toContain('option fallback path');

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('sequence');
    expect(second.edges[0].data?.seqFragment).toMatchObject({
      type: 'critical',
      condition: 'primary path',
      branchKind: 'start',
    });
    expect(second.edges[1].data?.seqFragment).toMatchObject({
      type: 'critical',
      condition: 'fallback path',
      branchKind: 'option',
    });
  });
});
