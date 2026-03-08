import { describe, expect, it } from 'vitest';
import { parseMermaidByType } from '@/services/mermaid/parseMermaidByType';
import { toMermaid } from './exportService';

describe('remaining Mermaid family round-trip', () => {
  it('preserves mindmap family through parse/export/parse', () => {
    const source = `
      mindmap
        Root
          Child A
            Grandchild
          Child B
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('mindmap');
    expect(first.nodes.length).toBeGreaterThan(0);

    const exported = toMermaid(first.nodes, first.edges);
    expect(exported.startsWith('mindmap')).toBe(true);

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('mindmap');
    expect(second.nodes).toHaveLength(first.nodes.length);
    expect(second.edges).toHaveLength(first.edges.length);
  });

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

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('journey');
    expect(second.nodes).toHaveLength(first.nodes.length);
    expect(second.edges).toHaveLength(first.edges.length);
  });

  it('preserves classDiagram family relation semantics through parse/export/parse', () => {
    const source = `
      classDiagram
      class User {
        +id: UUID
        +name: String
      }
      class Account
      User o-- Account : owns
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('classDiagram');
    expect(first.nodes.length).toBeGreaterThan(0);
    expect(first.edges.length).toBe(1);

    const exported = toMermaid(first.nodes, first.edges);
    expect(exported.startsWith('classDiagram')).toBe(true);
    expect(exported).toContain('User o-- Account : owns');

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('classDiagram');
    expect(second.nodes).toHaveLength(first.nodes.length);
    expect(second.edges).toHaveLength(first.edges.length);
    expect(second.edges[0].data?.classRelation).toBe('o--');
    expect(second.edges[0].data?.classRelationLabel).toBe('owns');
  });

  it('preserves erDiagram family relation semantics through parse/export/parse', () => {
    const source = `
      erDiagram
      CUSTOMER {
        string id PK
      }
      ORDER {
        string id PK
      }
      CUSTOMER ||--o{ ORDER : places
    `;

    const first = parseMermaidByType(source);
    expect(first.error).toBeUndefined();
    expect(first.diagramType).toBe('erDiagram');
    expect(first.nodes.length).toBeGreaterThan(0);
    expect(first.edges.length).toBe(1);

    const exported = toMermaid(first.nodes, first.edges);
    expect(exported.startsWith('erDiagram')).toBe(true);
    expect(exported).toContain('CUSTOMER ||--o{ ORDER : places');

    const second = parseMermaidByType(exported);
    expect(second.error).toBeUndefined();
    expect(second.diagramType).toBe('erDiagram');
    expect(second.nodes).toHaveLength(first.nodes.length);
    expect(second.edges).toHaveLength(first.edges.length);
    expect(second.edges[0].data?.erRelation).toBe('||--o{');
    expect(second.edges[0].data?.erRelationLabel).toBe('places');
  });
});
