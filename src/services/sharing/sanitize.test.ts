import { describe, expect, it } from 'vitest';
import { sanitizeDiagramForSharing } from './sanitize';

describe('sanitizeDiagramForSharing', () => {
  it('keeps only allowlisted share fields', () => {
    const payload = sanitizeDiagramForSharing({
      nodes: [{ id: 'n-1', type: 'process', position: { x: 0, y: 0 }, data: { label: 'Node' } }],
      edges: [{ id: 'e-1', source: 'n-1', target: 'n-1', type: 'smoothstep', data: {} }],
      diagramType: 'flowchart',
      viewport: { x: 10, y: 20, zoom: 1.1 },
      version: '1.0.0',
      aiSettings: { apiKey: 'secret' },
      brandConfig: { appName: 'private' },
    });

    expect(payload).toHaveProperty('nodes');
    expect(payload).toHaveProperty('edges');
    expect(payload).toHaveProperty('diagramType');
    expect(payload).toHaveProperty('viewport');
    expect(payload).toHaveProperty('version');
    expect('aiSettings' in payload).toBe(false);
    expect('brandConfig' in payload).toBe(false);
  });
});
