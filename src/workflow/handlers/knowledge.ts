import { useFlowStore } from '@/store';
import { WorkflowHandlerError, type WorkflowNodeHandler } from '../engine/types';
import { getKnowledgeDocument } from '../rag/documentStore';
import { retrieveTopK } from '../rag/retrieveTopK';
import { firstUpstreamText, warnMissingSelectors } from './llm';

const DEFAULT_TOP_K = 3;

export const knowledgeHandler: WorkflowNodeHandler = {
  async run({ data, pool, incomers, signal, log }) {
    const queryResolution = pool.resolveTemplate(data.query ?? '');
    warnMissingSelectors(queryResolution.missing, log);
    const query = queryResolution.value.trim() || firstUpstreamText(pool, incomers).trim();
    if (!query) {
      throw new WorkflowHandlerError('workflowMode.log.emptyQuery');
    }

    const doc = getKnowledgeDocument(data.knowledgeDocId);
    if (!doc) {
      throw new WorkflowHandlerError('workflowMode.log.knowledgeNoDocument');
    }

    const topK = data.knowledgeTopK ?? DEFAULT_TOP_K;
    const { chunks, method } = await retrieveTopK(
      query,
      doc,
      topK,
      useFlowStore.getState().aiSettings,
      signal,
      () => log({ level: 'warn', messageKey: 'workflowMode.log.knowledgeDegraded' })
    );

    log({
      level: 'info',
      messageKey: 'workflowMode.log.knowledgeHits',
      messageParams: { count: chunks.length },
    });

    return {
      outputs: {
        text: chunks.map((chunk) => chunk.text).join('\n\n'),
        chunks,
        method,
      },
    };
  },
};
