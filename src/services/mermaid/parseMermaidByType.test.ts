import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  initializeDiagramTypeRuntime,
  resetDiagramTypeRuntimeForTests,
} from '@/diagram-types/bootstrap';
import { unregisterDiagramPluginForTests } from '@/diagram-types/core';
import { parseMermaidByType } from './parseMermaidByType';

describe('parseMermaidByType', () => {
  it('parses supported flowchart families', () => {
    const result = parseMermaidByType(`
      flowchart TD
      A[Start] --> B[End]
    `);

    expect(result.error).toBeUndefined();
    expect(result.diagramType).toBe('flowchart');
    expect(result.importState).toBe('editable_full');
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
  });

  it('uses plugin-backed flowchart path', () => {
    const result = parseMermaidByType(`
      graph LR
      A --> B
    `);

    expect(result.error).toBeUndefined();
    expect(result.diagramType).toBe('flowchart');
    expect(result.direction).toBe('LR');
  });

  it('returns flowchart diagnostics for malformed structure without failing parse', () => {
    const result = parseMermaidByType(`
      flowchart TD
      subgraph
        A --> B
      stray words
      end
      end
    `);

    expect(result.diagramType).toBe('flowchart');
    expect(result.error).toBeUndefined();
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.importState).toBe('editable_partial');
    expect(result.diagnostics?.some((message) =>
      message.includes('Invalid flowchart subgraph declaration at line')
    )).toBe(true);
    expect(result.diagnostics?.some((message) =>
      message.includes('Unexpected flowchart block closer at line')
    )).toBe(true);
    expect(result.structuredDiagnostics?.some((diagnostic) => diagnostic.code === 'MERMAID_SYNTAX')).toBe(true);
  });

  it('parses modern flowchart ids and class assignment directives through the dispatcher', () => {
    const result = parseMermaidByType(`
      flowchart TD
      api.gateway@{ shape: rect, label: "API Gateway" } --> db.primary[(Primary DB)]
      classDef selected fill:#dff,stroke:#08c,color:#024
      class api.gateway,db.primary selected
    `);

    expect(result.error).toBeUndefined();
    expect(result.diagramType).toBe('flowchart');
    expect(result.importState).toBe('editable_full');
    expect(result.nodes.find((node) => node.id === 'api.gateway')?.data.label).toBe('API Gateway');
    expect(result.nodes.find((node) => node.id === 'api.gateway')?.style).toMatchObject({
      backgroundColor: '#dff',
      borderColor: '#08c',
      color: '#024',
    });
    expect(result.edges[0]).toMatchObject({
      source: 'api.gateway',
      target: 'db.primary',
    });
  });

  it('preserves Mermaid subgraph identity metadata for editable conversion', () => {
    const result = parseMermaidByType(`
      flowchart TD
      subgraph WritePath["Write Path"]
        A[Alpha] --> B[Beta]
      end
    `);

    const section = result.nodes.find((node) => node.type === 'section');
    expect(section?.id).toBe('WritePath');
    expect(section?.data.sectionMermaidId).toBe('WritePath');
    expect(section?.data.sectionMermaidTitle).toBe('Write Path');
  });

  it('parses supported state diagram families', () => {
    const result = parseMermaidByType(`
      stateDiagram-v2
      [*] --> Idle
      Idle --> [*]
    `);

    expect(result.error).toBeUndefined();
    expect(result.diagramType).toBe('stateDiagram');
    expect(result.nodes.length).toBeGreaterThan(0);
  });

  it('keeps standalone composite state declarations parented through the dispatcher', () => {
    const result = parseMermaidByType(`
      stateDiagram-v2
      state Working {
        state Busy
        state Idle
        Busy --> Idle
      }
      Idle --> [*]
    `);

    expect(result.error).toBeUndefined();
    expect(result.diagramType).toBe('stateDiagram');
    expect(result.nodes.find((node) => node.id === 'Busy')?.parentId).toBe('Working');
    expect(result.nodes.find((node) => node.id === 'Idle')?.parentId).toBe('Working');
  });

  it('parses journey through plugin dispatcher', () => {
    const result = parseMermaidByType(`
      journey
      title Checkout
      section Happy
        Search: 5: User
        Buy: 3: User
    `);

    expect(result.diagramType).toBe('journey');
    expect(result.error).toBeUndefined();
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.nodes.every((node) => node.type === 'journey')).toBe(true);
  });

  it('returns journey diagnostics for malformed section and malformed score-like steps', () => {
    const result = parseMermaidByType(`
      journey
      section
      Open ticket: User
      Resolve issue: 5: Agent
    `);

    expect(result.diagramType).toBe('journey');
    expect(result.error).toBeUndefined();
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(
      result.diagnostics?.some((message) =>
        message.includes('Invalid journey section syntax at line')
      )
    ).toBe(true);
    expect(
      result.diagnostics?.some((message) => message.includes('Invalid journey score at line'))
    ).toBe(true);
  });

  it('parses architecture through plugin dispatcher', () => {
    const result = parseMermaidByType(`
      architecture-beta
      service api(server)[API]
      service db(database)[Database]
      api:R --> L:db : SQL
    `);

    expect(result.diagramType).toBe('architecture');
    expect(result.error).toBeUndefined();
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.edges.length).toBeGreaterThan(0);
    expect(result.nodes.every((node) => node.type === 'architecture')).toBe(true);
    expect(result.edges[0].data?.archDirection).toBe('-->');
    expect(result.edges[0].data?.archSourceSide).toBe('R');
    expect(result.edges[0].data?.archTargetSide).toBe('L');
  });

  it('rejects architecture recovery diagnostics in strict mode', () => {
    const result = parseMermaidByType(
      `
      architecture-beta
      service api(server)[API]
      api --> cache
    `,
      { architectureStrictMode: true }
    );

    expect(result.diagramType).toBe('architecture');
    expect(result.error).toContain('strict mode rejected');
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
    expect(
      result.diagnostics?.some((d) => d.includes('Recovered implicit service node "cache"'))
    ).toBe(true);
  });

  it('returns missing-header error for unsupported diagram types like gitGraph', () => {
    const result = parseMermaidByType(`
      gitGraph
      commit id: "A"
      commit id: "B"
    `);

    expect(result.error).toContain('gitGraph');
    expect(result.importState).toBe('unsupported_family');
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it('classifies missing chart headers as invalid source', () => {
    const result = parseMermaidByType('A --> B');

    expect(result.error).toContain('Missing chart type declaration');
    expect(result.importState).toBe('invalid_source');
    expect(result.structuredDiagnostics?.length).toBeGreaterThan(0);
    expect(result.structuredDiagnostics?.[0]?.severity).toBe('error');
  });

  it('parses semicolon-terminated node declarations correctly', () => {
    const result = parseMermaidByType(`
      graph TB
      A[Start] ==> B{Is it?};
      B -->|Yes| C[OK];
      C --> D[Rethink];
      D -.-> B;
      B ---->|No| E[End];
    `);

    expect(result.error).toBeUndefined();
    expect(result.nodes).toHaveLength(5);
    expect(result.edges).toHaveLength(5);

    const b = result.nodes.find((n) => n.id === 'B');
    expect(b?.data.label).toBe('Is it?');
    expect(b?.data.shape).toBe('diamond');

    const c = result.nodes.find((n) => n.id === 'C');
    expect(c?.data.label).toBe('OK');

    expect(result.edges.some((e) => e.source === 'B' && e.target === 'E')).toBe(true);
    expect(result.edges.some((e) => e.source === 'D' && e.target === 'B')).toBe(true);
  });

  it('normalizes extended arrows (----> and ====>) to standard forms', () => {
    const result = parseMermaidByType(`
      flowchart TD
      A ---->|No| B
      C ====> D
    `);

    expect(result.error).toBeUndefined();
    expect(result.edges).toHaveLength(2);
    expect(result.edges[0].source).toBe('A');
    expect(result.edges[0].target).toBe('B');
    expect(result.edges[1].source).toBe('C');
    expect(result.edges[1].target).toBe('D');
  });

  it('parses chained edges on a single line', () => {
    const result = parseMermaidByType(`
      flowchart LR
      A[Client] --> B[API] --> C[(DB)]
    `);

    expect(result.error).toBeUndefined();
    expect(result.nodes).toHaveLength(3);
    expect(result.edges).toHaveLength(2);
    expect(result.edges.map((edge) => `${edge.source}->${edge.target}`)).toEqual([
      'A->B',
      'B->C',
    ]);
  });

  it('keeps arrow-like text inside labels from corrupting edge parsing', () => {
    const result = parseMermaidByType(`
      flowchart TD
      A["A --> B?"] -->|"status --> ok"| B["Done"]
    `);

    expect(result.error).toBeUndefined();
    expect(result.nodes.find((node) => node.id === 'A')?.data.label).toBe('A --> B?');
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].label).toBe('status --> ok');
    expect(result.edges[0].source).toBe('A');
    expect(result.edges[0].target).toBe('B');
  });

  it('returns missing-header error when no family header exists', () => {
    const result = parseMermaidByType('A --> B');

    expect(result.error).toContain('Missing chart type declaration');
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it('degrades mindmap sources to the renderer-only snapshot path', () => {
    const result = parseMermaidByType(`
      mindmap
        Root
          Branch A
    `);

    expect(result.error).toBeUndefined();
    expect(result.diagramType).toBe('mindmap');
    expect(result.nativeParseUnavailable).toBe(true);
    expect(result.importState).toBe('unsupported_family');
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it('degrades classDiagram sources to the renderer-only snapshot path', () => {
    const result = parseMermaidByType(`
      classDiagram
      class Animal {
        +name: String
      }
      class Duck
      Animal <|-- Duck
    `);

    expect(result.error).toBeUndefined();
    expect(result.diagramType).toBe('classDiagram');
    expect(result.nativeParseUnavailable).toBe(true);
    expect(result.importState).toBe('unsupported_family');
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it('degrades erDiagram sources to the renderer-only snapshot path', () => {
    const result = parseMermaidByType(`
      erDiagram
      CUSTOMER {
        string name
      }
      CUSTOMER ||--o{ ORDER : places
    `);

    expect(result.error).toBeUndefined();
    expect(result.diagramType).toBe('erDiagram');
    expect(result.nativeParseUnavailable).toBe(true);
    expect(result.importState).toBe('unsupported_family');
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it('degrades sequenceDiagram sources to the renderer-only snapshot path', () => {
    const result = parseMermaidByType(`
      sequenceDiagram
      participant Alice
      participant Bob
      Alice->>Bob: Hello
      Bob-->>Alice: Hi
    `);

    expect(result.error).toBeUndefined();
    expect(result.diagramType).toBe('sequence');
    expect(result.nativeParseUnavailable).toBe(true);
    expect(result.importState).toBe('unsupported_family');
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });
});

describe('parseMermaidByType without a registered plugin', () => {
  beforeEach(() => {
    initializeDiagramTypeRuntime();
    unregisterDiagramPluginForTests('journey');
  });

  afterEach(() => {
    resetDiagramTypeRuntimeForTests();
    initializeDiagramTypeRuntime();
  });

  it('degrades to an error-free renderer-only result for the detected family', () => {
    const result = parseMermaidByType(`
      journey
      title Checkout
      section Happy
        Search: 5: User
    `);

    expect(result.error).toBeUndefined();
    expect(result.diagramType).toBe('journey');
    expect(result.nativeParseUnavailable).toBe(true);
    expect(result.importState).toBe('unsupported_family');
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it('keeps plugin-backed families natively parseable while another plugin is missing', () => {
    const result = parseMermaidByType(`
      flowchart TD
      A[Start] --> B[End]
    `);

    expect(result.error).toBeUndefined();
    expect(result.nativeParseUnavailable).toBeUndefined();
    expect(result.importState).toBe('editable_full');
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
  });
});

describe('parseMermaidByType without sequence plugin', () => {
  beforeEach(() => {
    initializeDiagramTypeRuntime();
    unregisterDiagramPluginForTests('sequence');
  });

  afterEach(() => {
    resetDiagramTypeRuntimeForTests();
    initializeDiagramTypeRuntime();
  });

  it('degrades to an error-free renderer-only result for sequence diagrams', () => {
    const result = parseMermaidByType(`
      sequenceDiagram
      participant Alice
      participant Bob
      Alice->>Bob: Hello
    `);

    expect(result.error).toBeUndefined();
    expect(result.diagramType).toBe('sequence');
    expect(result.nativeParseUnavailable).toBe(true);
    expect(result.importState).toBe('unsupported_family');
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });
});


