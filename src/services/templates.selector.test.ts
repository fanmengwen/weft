import { describe, expect, it } from 'vitest';
import { FLOW_TEMPLATES, getFlowTemplates } from './templates';

describe('template selector', () => {
  it('returns flowchart and workflow featured starters', () => {
    const templates = getFlowTemplates();
    const ids = templates.map((template) => template.id);

    expect(templates).toEqual(FLOW_TEMPLATES);
    expect(ids).toHaveLength(8);
    expect(ids).toContain('leave-approval-flow');
    expect(ids).toContain('online-hot-brief');
    expect(ids).toContain('weekly-report-generator');
    expect(ids).toContain('docs-qa-assistant');
    expect(ids).toContain('competitor-monitor-report');
    expect(templates.filter((template) => template.category === 'flowchart')).toHaveLength(4);
    expect(templates.filter((template) => template.category === 'workflow')).toHaveLength(4);
  });

  it('sorts by launch priority and preserves editorial metadata', () => {
    const templates = getFlowTemplates();

    expect(templates.every((template) => template.featured)).toBe(true);
    expect(templates[0]?.id).toBe('leave-approval-flow');
    expect(templates[0]?.replacementHints.length).toBeGreaterThanOrEqual(3);
    expect(templates[0]?.outcome.length).toBeGreaterThan(10);
    for (let index = 1; index < templates.length; index += 1) {
      expect(templates[index - 1]!.launchPriority).toBeGreaterThanOrEqual(
        templates[index]!.launchPriority
      );
    }
  });
});
