import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

const NODE_COMPONENT_FILES = [
  'src/components/CustomNode.tsx',
  'src/components/AnnotationNode.tsx',
  'src/components/SectionNode.tsx',
  'src/components/TextNode.tsx',
  'src/components/GroupNode.tsx',
  'src/components/SwimlaneNode.tsx',
  'src/components/ImageNode.tsx',
  'src/components/custom-nodes/BrowserNode.tsx',
  'src/components/custom-nodes/MobileNode.tsx',
  'src/components/custom-nodes/ClassNode.tsx',
  'src/components/custom-nodes/EntityNode.tsx',
  'src/components/custom-nodes/MindmapNode.tsx',
  'src/components/custom-nodes/JourneyNode.tsx',
  'src/components/custom-nodes/ArchitectureNode.tsx',
  'src/components/custom-nodes/IconNode.tsx',
  'src/components/custom-nodes/WireframeNodes.tsx',
] as const;

function readSource(path: string): string {
  return readFileSync(join(ROOT, path), 'utf8');
}

describe('node chrome coverage', () => {
  it('ensures each supported node component includes transform controls and 4-side handles', () => {
    for (const path of NODE_COMPONENT_FILES) {
      const source = readSource(path);
      expect(source, path).toContain('NodeTransformControls');
      expect(source, path).toContain('<Handle');
      expect(source, path).toContain('Position.Top');
      expect(source, path).toContain('Position.Right');
      expect(source, path).toContain('Position.Bottom');
      expect(source, path).toContain('Position.Left');
    }
  });

  it('keeps production node components on loose-mode universal handles', () => {
    for (const path of NODE_COMPONENT_FILES) {
      const source = readSource(path);
      expect(source, path).toContain('type="source"');
      expect(source, path).not.toContain('type="target"');
    }
  });
});
