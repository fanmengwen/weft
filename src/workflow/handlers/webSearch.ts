import { WorkflowHandlerError, type WorkflowNodeHandler } from '../engine/types';
import { useFlowStore } from '@/store';
import { firstUpstreamText, warnMissingSelectors } from './llm';
import {
  resolveDashScopeSearchEndpoint,
  searchWithDashScope,
} from './dashScopeSearch';

export interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
}

interface WikipediaSearchPage {
  title?: string;
  key?: string;
  excerpt?: string;
  description?: string | null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

function pickWikipediaHost(query: string): string {
  return /[一-鿿]/.test(query) ? 'zh.wikipedia.org' : 'en.wikipedia.org';
}

// Wikipedia's REST search is the one mainstream search endpoint that is
// free, keyless, and CORS-open — the only kind a pure-frontend BYOK app can
// call. Anything else (network error, zero hits) degrades to echoing the
// query so the workflow keeps flowing, with the degradation logged.
async function searchWikipedia(query: string, signal: AbortSignal): Promise<WebSearchResult[]> {
  const host = pickWikipediaHost(query);
  const url = `https://${host}/w/rest.php/v1/search/page?q=${encodeURIComponent(query)}&limit=3`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Wikipedia search failed with HTTP ${response.status}`);
  }
  const payload = (await response.json()) as { pages?: WikipediaSearchPage[] };
  return (payload.pages ?? [])
    .filter((page) => page.title)
    .map((page) => ({
      title: page.title ?? '',
      snippet: stripHtml(page.excerpt ?? page.description ?? ''),
      url: `https://${host}/wiki/${encodeURIComponent(page.key ?? page.title ?? '')}`,
    }));
}

export const webSearchHandler: WorkflowNodeHandler = {
  async run({ data, pool, incomers, signal, log }) {
    const queryResolution = pool.resolveTemplate(data.query ?? '');
    warnMissingSelectors(queryResolution.missing, log);
    const query = queryResolution.value.trim() || firstUpstreamText(pool, incomers).trim();
    if (!query) {
      throw new WorkflowHandlerError('workflowMode.log.emptyQuery');
    }

    const aiSettings = useFlowStore.getState().aiSettings;
    const dashScopeEndpoint = resolveDashScopeSearchEndpoint(aiSettings);
    if (dashScopeEndpoint) {
      try {
        const result = await searchWithDashScope(
          dashScopeEndpoint,
          aiSettings,
          query,
          data.searchFreshnessDays ?? 30,
          signal
        );
        log({
          level: result.results.length > 0 ? 'info' : 'warn',
          messageKey:
            result.results.length > 0
              ? 'workflowMode.log.searchHits'
              : 'workflowMode.log.searchNoResults',
          messageParams: { count: result.results.length },
        });
        return { outputs: result };
      } catch (error) {
        if (signal.aborted) {
          throw error;
        }
        throw new WorkflowHandlerError('workflowMode.log.searchFailed', {
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    }

    let results: WebSearchResult[] = [];
    try {
      results = await searchWikipedia(query, signal);
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
      log({
        level: 'warn',
        messageKey: 'workflowMode.log.searchDegraded',
        messageParams: { reason: error instanceof Error ? error.message : String(error) },
      });
      return { outputs: { text: query, results: [] } };
    }

    if (results.length === 0) {
      log({ level: 'warn', messageKey: 'workflowMode.log.searchNoResults' });
      return { outputs: { text: query, results: [] } };
    }

    const text = results
      .map((result) => `${result.title}: ${result.snippet}`)
      .join('\n');
    log({
      level: 'info',
      messageKey: 'workflowMode.log.searchHits',
      messageParams: { count: results.length },
    });
    return { outputs: { text, results } };
  },
};
