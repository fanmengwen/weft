/**
 * Stroke for the in-progress connection line only; placed edges render
 * through the WorkflowEdge component, which owns the same flat look.
 * Chart mode keeps DEFAULT_EDGE_OPTIONS in src/constants.ts.
 */
export const WORKFLOW_EDGE_STYLE = {
  stroke: 'var(--wf-edge)',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
} as const;
