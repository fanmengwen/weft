import type { WorkflowNodeHandler } from '../engine/types';
import { warnMissingSelectors } from './llm';

export const outputHandler: WorkflowNodeHandler = {
  async run({ data, pool, incomers, log }) {
    // Prefer an explicit content template (fixed copy or {{node.key}} refs).
    const template = data.text?.trim() ?? '';
    if (template) {
      const resolution = pool.resolveTemplate(template);
      warnMissingSelectors(resolution.missing, log);
      if (!resolution.value) {
        log({ level: 'warn', messageKey: 'workflowMode.log.emptyOutput' });
      }
      return { outputs: { text: resolution.value } };
    }

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
