import { describe, expect, it } from 'vitest';
import { FLOW_TEMPLATES, getFlowTemplates } from './templates';

describe('template selector', () => {
    it('returns legacy templates when feature flag path is disabled', () => {
        expect(getFlowTemplates(false)).toEqual(FLOW_TEMPLATES);
    });

    it('returns registry-backed templates when feature flag path is enabled', () => {
        const templates = getFlowTemplates(true);
        const ids = templates.map((template) => template.id);

        expect(ids).toEqual(['starter-flowchart-checkout', 'starter-architecture-api']);
    });
});
