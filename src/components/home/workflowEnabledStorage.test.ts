import { beforeEach, describe, expect, it } from 'vitest';
import {
  copyWorkflowEnabled,
  isWorkflowEnabled,
  removeWorkflowEnabled,
  setWorkflowEnabled,
} from './workflowEnabledStorage';

describe('workflowEnabledStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults missing documents to enabled', () => {
    expect(isWorkflowEnabled('missing')).toBe(true);
  });

  it('persists and returns enabled state', () => {
    setWorkflowEnabled('doc-1', false);
    expect(isWorkflowEnabled('doc-1')).toBe(false);
  });

  it('removes and copies enabled state', () => {
    setWorkflowEnabled('a', false);
    copyWorkflowEnabled('a', 'b');
    expect(isWorkflowEnabled('b')).toBe(false);
    removeWorkflowEnabled('a');
    expect(isWorkflowEnabled('a')).toBe(true);
  });
});
