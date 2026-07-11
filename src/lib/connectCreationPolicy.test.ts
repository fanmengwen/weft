import { describe, expect, it } from 'vitest';
import { getDefaultConnectedNodeSpec } from './connectCreationPolicy';

describe('connectCreationPolicy', () => {
  it('defaults generic connectors to a rounded process node', () => {
    expect(getDefaultConnectedNodeSpec('process')).toEqual({
      type: 'process',
      shape: 'rounded',
    });
  });

  it('propagates structured node families through connector creation', () => {
    expect(getDefaultConnectedNodeSpec('architecture')).toEqual({ type: 'architecture' });

    expect(getDefaultConnectedNodeSpec('annotation')).toEqual({ type: 'annotation' });
  });
});
