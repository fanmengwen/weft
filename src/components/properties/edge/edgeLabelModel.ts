import type { FlowEdge } from '@/lib/types';

function trimToOptionalString(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getEditableEdgeLabel(edge: FlowEdge): string {
  return typeof edge.label === 'string' ? edge.label : '';
}

export function buildEdgeLabelUpdates(value: string): Partial<FlowEdge> {
  return {
    label: trimToOptionalString(value),
  };
}

export function hasEditableEdgeLabel(edge: FlowEdge): boolean {
  return getEditableEdgeLabel(edge).trim().length > 0;
}
