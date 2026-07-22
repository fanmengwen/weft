import { describe, expect, it } from 'vitest';
import { buildFlowpilotAssistantSystemInstruction } from './prompting';

describe('buildFlowpilotAssistantSystemInstruction', () => {
  it('directs replies to the ui language in both modes', () => {
    expect(buildFlowpilotAssistantSystemInstruction('answer', 'zh')).toContain('Respond in Chinese (Simplified)');
    expect(buildFlowpilotAssistantSystemInstruction('plan', 'zh')).toContain('Respond in Chinese (Simplified)');
  });

  it('falls back to english for unsupported locales', () => {
    expect(buildFlowpilotAssistantSystemInstruction('answer', 'ko')).toContain('Respond in English');
  });
});
