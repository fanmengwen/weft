import { describe, expect, it } from 'vitest';
import type { Node } from '@/lib/reactflowCompat';
import { NodeType, type NodeData } from '@/lib/types';
import {
  filterBulkUpdatesForNode,
  getBulkAffectedNodeCount,
  getNodeBulkEditCapabilities,
} from './nodeBulkEditing';

function createNode(
  type: string,
  data: Partial<NodeData> = {}
): Node<NodeData> {
  return {
    id: `${type}-${Math.random()}`,
    type,
    position: { x: 0, y: 0 },
    data: {
      label: 'Node',
      ...data,
    },
  } as Node<NodeData>;
}

describe('nodeBulkEditing', () => {
  it('assigns capabilities by effective property surface instead of every node sharing the same set', () => {
    expect(getNodeBulkEditCapabilities(createNode(NodeType.CUSTOM)).has('shape')).toBe(true);
    expect(getNodeBulkEditCapabilities(createNode(NodeType.ANNOTATION)).has('shape')).toBe(false);
    expect(getNodeBulkEditCapabilities(createNode(NodeType.ARCHITECTURE)).has('architecture')).toBe(
      true
    );
  });

  it('filters unsupported updates per node during bulk apply', () => {
    const annotationNode = createNode(NodeType.ANNOTATION);
    const architectureNode = createNode(NodeType.ARCHITECTURE);
    const genericNode = createNode(NodeType.CUSTOM);

    expect(
      filterBulkUpdatesForNode(annotationNode, {
        shape: 'diamond',
        color: 'blue',
        colorMode: 'filled',
      })
    ).toEqual({ color: 'blue' });

    expect(
      filterBulkUpdatesForNode(architectureNode, {
        archEnvironment: 'production',
        shape: 'rounded',
      })
    ).toEqual({ archEnvironment: 'production' });

    expect(
      filterBulkUpdatesForNode(genericNode, {
        shape: 'rounded',
        color: 'custom',
        colorMode: 'filled',
        customColor: '#ff9900',
      })
    ).toEqual({
      shape: 'rounded',
      color: 'custom',
      colorMode: 'filled',
      customColor: '#ff9900',
    });
  });

  it('counts affected nodes from scoped updates and shared label transforms', () => {
    const selectedNodes = [
      createNode(NodeType.CUSTOM),
      createNode(NodeType.ANNOTATION),
      createNode(NodeType.ARCHITECTURE),
    ];

    expect(
      getBulkAffectedNodeCount(selectedNodes, {
        shape: 'hexagon',
      })
    ).toBe(1);

    expect(
      getBulkAffectedNodeCount(
        selectedNodes,
        {
          archEnvironment: 'production',
        },
        { labelPrefix: 'New ' }
      )
    ).toBe(3);
  });
});
