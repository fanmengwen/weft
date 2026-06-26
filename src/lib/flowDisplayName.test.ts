import { describe, expect, it } from 'vitest';
import { DEFAULT_FLOW_NAME, getFlowDisplayName, isDefaultFlowName } from './flowDisplayName';

describe('flowDisplayName', () => {
  const t = (key: string, options?: { defaultValue?: string }) =>
    key === 'editor.untitled' ? '未命名流程' : (options?.defaultValue ?? key);

  it('detects the default stored flow name', () => {
    expect(isDefaultFlowName(DEFAULT_FLOW_NAME)).toBe(true);
    expect(isDefaultFlowName(' Renamed Flow ')).toBe(false);
  });

  it('maps the default stored name to localized display copy', () => {
    expect(getFlowDisplayName(DEFAULT_FLOW_NAME, t)).toBe('未命名流程');
  });

  it('returns custom names unchanged', () => {
    expect(getFlowDisplayName('System Design', t)).toBe('System Design');
  });

  it('falls back to localized untitled for empty names', () => {
    expect(getFlowDisplayName('   ', t)).toBe('未命名流程');
  });
});
