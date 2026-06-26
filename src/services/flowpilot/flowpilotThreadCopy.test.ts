import { describe, expect, it } from 'vitest';
import {
  getPlanCardVariant,
  getPlanStepKeys,
  getPlanSummaryKey,
  inferCopyKeyFromPreviewTitle,
  threadKey,
} from './flowpilotThreadCopy';

describe('flowpilotThreadCopy', () => {
  it('uses a minimal plan card for diagram preview routes', () => {
    expect(getPlanCardVariant('diagram_preview')).toBe('minimal');
    expect(getPlanCardVariant('diagram_apply_ready')).toBe('minimal');
    expect(getPlanCardVariant('plan')).toBe('full');
  });

  it('maps diagram preview plans to the diagram summary key', () => {
    expect(getPlanSummaryKey('diagram_preview', 'plan_diagram')).toBe(
      threadKey('planSummary', 'diagramPreview')
    );
  });

  it('maps explicit plan routes to the plan summary key', () => {
    expect(getPlanSummaryKey('plan', 'plan_diagram')).toBe(threadKey('planSummary', 'plan'));
  });

  it('returns localized step keys for each skill', () => {
    expect(getPlanStepKeys('plan_diagram', 0).map((step) => step.key)).toEqual([
      threadKey('step', 'inspectCanvas'),
      threadKey('step', 'outlineStructure'),
    ]);
    expect(getPlanStepKeys('edit_selected_nodes', 3)[0]).toEqual({
      key: threadKey('step', 'inspectSelection'),
      count: 3,
    });
  });

  it('infers legacy preview titles to copy keys', () => {
    expect(inferCopyKeyFromPreviewTitle('Import ready — review changes before applying.')).toBe(
      'importReady'
    );
    expect(
      inferCopyKeyFromPreviewTitle('Codebase enhancement ready — review the upgraded diagram.')
    ).toBe('codeEnhancementReady');
  });
});