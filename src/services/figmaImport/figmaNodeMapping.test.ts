import { describe, expect, it } from 'vitest';
import { mapFigmaTextLayerToAnnotationNode } from './figmaNodeMapping';

describe('mapFigmaTextLayerToAnnotationNode', () => {
  it('maps figma text layer content to an annotation node', () => {
    const node = mapFigmaTextLayerToAnnotationNode({
      text: 'Design note',
      position: { x: 12, y: 34 },
      layerId: 'default',
    });

    expect(node.type).toBe('annotation');
    expect(node.position).toEqual({ x: 12, y: 34 });
    expect(node.data.label).toBe('Design note');
    expect(node.data.subLabel).toBe('');
    expect(node.data.layerId).toBe('default');
  });
});
