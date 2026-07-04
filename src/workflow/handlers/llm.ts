import { chatWithFlowpilot } from '@/services/aiService';
import { useFlowStore } from '@/store';
import type { FlowNode } from '@/lib/types';
import { WorkflowHandlerError, type WorkflowNodeHandler, type WorkflowRunContext } from '../engine/types';
import type { VariablePool } from '../engine/variablePool';

const FALLBACK_SYSTEM_PROMPT =
  'You are a helpful assistant running inside a visual workflow. Answer the request directly in plain text, without markdown fences around the whole reply.';

export function firstUpstreamText(pool: VariablePool, incomers: FlowNode[]): string {
  for (const incomer of incomers) {
    const text = pool.getNodeOutputs(incomer.id)?.text;
    if (typeof text === 'string' && text.trim()) {
      return text;
    }
  }
  return '';
}

export function warnMissingSelectors(
  missing: string[],
  log: WorkflowRunContext['log']
): void {
  if (missing.length > 0) {
    log({
      level: 'warn',
      messageKey: 'workflowMode.log.missingVariables',
      messageParams: { selectors: missing.join(', ') },
    });
  }
}

export const llmHandler: WorkflowNodeHandler = {
  async run({ data, pool, incomers, signal, emitStream, log }) {
    const aiSettings = useFlowStore.getState().aiSettings;

    const promptResolution = pool.resolveTemplate(data.prompt ?? '');
    warnMissingSelectors(promptResolution.missing, log);
    let prompt = promptResolution.value.trim();

    // An empty prompt degrades to a pass-through of the direct upstream text
    // so a bare textInput → llm → output chain works without templates.
    if (!prompt) {
      const upstreamText = firstUpstreamText(pool, incomers);
      if (upstreamText) {
        prompt = upstreamText;
        log({ level: 'info', messageKey: 'workflowMode.log.promptFromUpstream' });
      }
    }
    if (!prompt) {
      throw new WorkflowHandlerError('workflowMode.log.emptyPrompt');
    }

    const systemResolution = pool.resolveTemplate(data.systemPrompt ?? '');
    warnMissingSelectors(systemResolution.missing, log);
    const systemPrompt = systemResolution.value.trim() || FALLBACK_SYSTEM_PROMPT;

    // Node-level model is an optional override; blank means "follow the
    // global AI settings" so BYOK providers keep working out of the box.
    const model = data.model?.trim() || aiSettings.model;

    const text = await chatWithFlowpilot(
      [],
      prompt,
      systemPrompt,
      aiSettings.apiKey,
      model,
      aiSettings.provider || 'gemini',
      aiSettings.customBaseUrl,
      emitStream,
      signal
    );

    return { outputs: { text } };
  },
};
