import type { NodeData } from '@/lib/types';

export interface ConnectedNodeSpec {
  type: string;
  shape?: NodeData['shape'];
}

const SELF_PROPAGATING_TYPES: Record<string, ConnectedNodeSpec> = {
  annotation: { type: 'annotation' },
  architecture: { type: 'architecture' },
  start: { type: 'process', shape: 'rounded' },
  end: { type: 'process', shape: 'rounded' },
  decision: { type: 'process', shape: 'rounded' },
};

export function getDefaultConnectedNodeSpec(sourceNodeType?: string | null): ConnectedNodeSpec {
  return SELF_PROPAGATING_TYPES[sourceNodeType ?? ''] ?? { type: 'process', shape: 'rounded' };
}
