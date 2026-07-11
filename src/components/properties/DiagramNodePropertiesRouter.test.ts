import { describe, expect, it } from 'vitest';
import { NodeType } from '@/lib/types';
import { resolveNodePropertiesPanelDiagramType } from './DiagramNodePropertiesRouter';

describe('resolveNodePropertiesPanelDiagramType', () => {
  it('keeps the active diagram type for generic flowchart nodes', () => {
    expect(resolveNodePropertiesPanelDiagramType(NodeType.PROCESS, 'flowchart')).toBe('flowchart');
  });

  it('routes other specialized node families to their dedicated property panels', () => {
    expect(resolveNodePropertiesPanelDiagramType(NodeType.JOURNEY, 'flowchart')).toBe('journey');
    expect(resolveNodePropertiesPanelDiagramType(NodeType.ARCHITECTURE, 'flowchart')).toBe('architecture');
  });
});
