import type { WorkflowNodeHandler } from '../engine/types';

export const outputHandler: WorkflowNodeHandler = {
  async run({ pool, incomers, log }) {
    const text = incomers
      .map((incomer) => pool.getNodeOutputs(incomer.id)?.text)
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
      .join('\n\n');
    if (!text) {
      log({ level: 'warn', messageKey: 'workflowMode.log.emptyOutput' });
    }
    return { outputs: { text } };
  },
};
