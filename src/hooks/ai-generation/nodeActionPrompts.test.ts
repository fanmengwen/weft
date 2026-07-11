import { describe, expect, it } from 'vitest';
import { buildArchitectureServiceSuggestionPrompt } from './nodeActionPrompts';
import type { FlowNode } from '@/lib/types';

function createArchitectureNode(): FlowNode {
  return {
    id: 'arch-1',
    type: 'architecture',
    position: { x: 0, y: 0 },
    data: {
      label: 'orders',
      archProvider: 'aws',
      archResourceType: 'service',
      archEnvironment: 'production',
      archZone: 'private',
      archTrustDomain: 'internal',
    },
  };
}

describe('nodeActionPrompts', () => {
  it('builds a focused architecture suggestion prompt with infrastructure metadata', () => {
    const prompt = buildArchitectureServiceSuggestionPrompt(createArchitectureNode());

    expect(prompt).toContain('Provider: aws');
    expect(prompt).toContain('Resource type: service');
    expect(prompt).toContain('Only update the selected architecture node');
  });
});
