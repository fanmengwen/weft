import { describe, expect, it } from 'vitest';
import { DIAGRAM_TYPES } from '@/lib/types';
import { initializeDiagramTypeRuntime } from '@/diagram-types/bootstrap';
import {
  getMermaidFamilySupportMatrixEntry,
  listMermaidFamilySupportMatrix,
} from './supportMatrix';

describe('mermaid support matrix', () => {
  it('covers every supported editable Mermaid family exactly once', () => {
    const entries = listMermaidFamilySupportMatrix();

    expect(entries).toHaveLength(DIAGRAM_TYPES.length);
    expect(entries.map((entry) => entry.family)).toEqual(
      expect.arrayContaining([...DIAGRAM_TYPES])
    );
  });

  it('orders families by execution priority', () => {
    const entries = listMermaidFamilySupportMatrix();

    expect(entries[0].family).toBe('flowchart');
    expect(entries[1].family).toBe('architecture');
    expect(entries[2].family).toBe('sequence');
  });

  it('exposes partial-support guidance for richer technical families', () => {
    expect(getMermaidFamilySupportMatrixEntry('stateDiagram').partialConstructs).toEqual(
      expect.arrayContaining(['advanced state semantics beyond current editable model'])
    );
  });

  it('derives unsupported constructs for families without a registered plugin', () => {
    initializeDiagramTypeRuntime();

    const entry = getMermaidFamilySupportMatrixEntry('sequence');

    expect(entry.label).toBe('Sequence');
    expect(entry.editableConstructs).toEqual([]);
    expect(entry.partialConstructs).toEqual([]);
    expect(entry.unsupportedConstructs.length).toBeGreaterThan(0);
    expect(
      getMermaidFamilySupportMatrixEntry('flowchart').editableConstructs.length
    ).toBeGreaterThan(0);
  });
});
