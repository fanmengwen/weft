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
});
