import { describe, expect, it } from 'vitest';
import { getShowcaseTemplatesByKind, HOME_SHOWCASE_TEMPLATES } from './homeShowcase';

describe('homeShowcase', () => {
  it('groups showcase templates by kind for the home list layout', () => {
    const charts = getShowcaseTemplatesByKind('chart');
    const workflows = getShowcaseTemplatesByKind('workflow');

    expect(charts).toHaveLength(2);
    expect(workflows).toHaveLength(2);
    expect(charts.every((item) => item.kind === 'chart' && item.templateId)).toBe(true);
    expect(workflows.every((item) => item.kind === 'workflow' && item.templateId)).toBe(true);
    expect(HOME_SHOWCASE_TEMPLATES).toHaveLength(charts.length + workflows.length);
  });
});
