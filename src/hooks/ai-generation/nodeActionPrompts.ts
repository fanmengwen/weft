import type { FlowNode } from '@/lib/types';

export function buildArchitectureServiceSuggestionPrompt(node: FlowNode): string {
  const context = [
    `Selected architecture node label: ${node.data.label || 'New Service'}`,
    `Provider: ${String(node.data.archProviderLabel || node.data.archProvider || 'custom')}`,
    `Resource type: ${String(node.data.archResourceType || 'service')}`,
    `Environment: ${String(node.data.archEnvironment || 'default')}`,
    `Zone: ${String(node.data.archZone || '') || 'none'}`,
    `Trust domain: ${String(node.data.archTrustDomain || '') || 'none'}`,
  ].join('\n');

  return [
    'Refine the selected architecture node into a context-aware service suggestion.',
    'Only update the selected architecture node and, if needed, its direct metadata.',
    'Do not add unrelated nodes or edges.',
    'Choose a more specific label, icon, provider-aligned service metadata, and a short subLabel.',
    'Return valid Weft DSL for the full updated diagram.',
    context,
  ].join('\n\n');
}
