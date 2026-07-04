import type { WorkflowNodeHandler } from '../engine/types';

export const textInputHandler: WorkflowNodeHandler = {
  async run({ data, log }) {
    const text = data.text ?? '';
    if (!text.trim()) {
      log({ level: 'warn', messageKey: 'workflowMode.log.emptyTextInput' });
    }
    return { outputs: { text } };
  },
};
