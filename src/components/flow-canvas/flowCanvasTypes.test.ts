import { describe, expect, it } from 'vitest';
import { flowCanvasEdgeTypes, flowCanvasNodeTypes } from './flowCanvasTypes';

describe('flowCanvasNodeTypes', () => {
  it('matches the node type registry baseline', () => {
    const nodeTypeKeys = Object.keys(flowCanvasNodeTypes).sort();
    expect(nodeTypeKeys).toMatchInlineSnapshot(`
      [
        "annotation",
        "architecture",
        "browser",
        "custom",
        "decision",
        "end",
        "mermaid_svg",
        "mobile",
        "process",
        "section",
        "start",
      ]
    `);
  });

  it('registers architecture node renderer', () => {
    expect(flowCanvasNodeTypes.architecture).toBeDefined();
  });
});

describe('flowCanvasEdgeTypes', () => {
  it('matches the edge type registry baseline', () => {
    const edgeTypeKeys = Object.keys(flowCanvasEdgeTypes).sort();
    expect(edgeTypeKeys).toMatchInlineSnapshot(`
      [
        "bezier",
        "default",
        "smoothstep",
        "step",
        "straight",
      ]
    `);
  });
});
