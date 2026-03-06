import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

const HANDLE_POLICY_FILES = [
  'src/components/CustomNode.tsx',
  'src/components/ImageNode.tsx',
  'src/components/TextNode.tsx',
  'src/components/GroupNode.tsx',
  'src/components/SwimlaneNode.tsx',
  'src/components/custom-nodes/ArchitectureNode.tsx',
  'src/components/custom-nodes/BrowserNode.tsx',
  'src/components/custom-nodes/ClassNode.tsx',
  'src/components/custom-nodes/EntityNode.tsx',
  'src/components/custom-nodes/IconNode.tsx',
  'src/components/custom-nodes/JourneyNode.tsx',
  'src/components/custom-nodes/MindmapNode.tsx',
  'src/components/custom-nodes/MobileNode.tsx',
  'src/components/custom-nodes/WireframeNodes.tsx',
] as const;

function readSource(path: string): string {
  return readFileSync(join(ROOT, path), 'utf8');
}

describe('handle interaction usage guardrails', () => {
  it('keeps all node renderers on shared handle interaction helpers', () => {
    for (const path of HANDLE_POLICY_FILES) {
      const source = readSource(path);
      expect(source, path).toContain('getHandlePointerEvents');
      expect(source, path).toContain('getV2HandleVisibilityClass');
    }
  });

  it('keeps flow-handle-hitarea literal only in shared helper', () => {
    const helperSource = readSource('src/components/handleInteraction.ts');
    expect(helperSource).toContain('flow-handle-hitarea');

    for (const path of HANDLE_POLICY_FILES) {
      const source = readSource(path);
      expect(source, path).not.toContain('flow-handle-hitarea');
    }
  });

  it('keeps handle pointer policy centralized and avoids hardcoded selected-pointer ternaries', () => {
    for (const path of HANDLE_POLICY_FILES) {
      const source = readSource(path);
      expect(source, path).not.toContain("selected && visualQualityV2Enabled ? 'none' : 'all'");
      expect(source, path).not.toContain('pointerEvents: selected && visualQualityV2Enabled');
    }
  });
});
