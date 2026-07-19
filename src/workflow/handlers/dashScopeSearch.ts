import type { AISettings } from '@/store/types';

export interface DashScopeSearchResult {
  title: string;
  snippet: string;
  url: string;
  siteName?: string;
}

export interface DashScopeSearchResponse {
  text: string;
  results: DashScopeSearchResult[];
}

interface SearchPayload {
  output?: {
    choices?: Array<{ message?: { content?: string } }>;
    search_info?: {
      search_results?: Array<{
        title?: string;
        snippet?: string;
        url?: string;
        site_name?: string;
      }>;
    };
  };
}

export function resolveDashScopeSearchEndpoint(settings: AISettings): string | null {
  if (settings.provider !== 'custom' || !settings.customBaseUrl) {
    return null;
  }
  try {
    const url = new URL(settings.customBaseUrl);
    const isDashScope =
      url.hostname === 'dashscope.aliyuncs.com' || url.hostname.endsWith('.maas.aliyuncs.com');
    if (!isDashScope) {
      return null;
    }
    url.pathname = '/api/v1/services/aigc/text-generation/generation';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeResults(payload: SearchPayload): DashScopeSearchResult[] {
  return (payload.output?.search_info?.search_results ?? [])
    .filter((entry) => Boolean(entry.title?.trim()) && /^https?:\/\//.test(entry.url ?? ''))
    .map((entry) => ({
      title: entry.title!.trim(),
      snippet: entry.snippet?.trim() || entry.title!.trim(),
      url: entry.url!,
      siteName: entry.site_name?.trim() || undefined,
    }));
}

function formatSearchText(content: string, results: DashScopeSearchResult[]): string {
  if (results.length === 0) {
    return '';
  }
  const sources = results.map(
    (result, index) => `${index + 1}. [${result.title}](${result.url})\n   ${result.snippet}`
  );
  return [content.trim(), '可靠来源（引用时保留以下 Markdown 链接）：', ...sources]
    .filter(Boolean)
    .join('\n\n');
}

export async function searchWithDashScope(
  endpoint: string,
  settings: AISettings,
  query: string,
  freshness: 7 | 30 | 180 | 365,
  signal: AbortSignal
): Promise<DashScopeSearchResponse> {
  if (!settings.apiKey) {
    throw new Error('DashScope API key is missing');
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model || 'qwen-plus',
      input: { messages: [{ role: 'user', content: query }] },
      parameters: {
        enable_search: true,
        result_format: 'message',
        search_options: {
          forced_search: true,
          enable_source: true,
          enable_citation: true,
          citation_format: '[ref_<number>]',
          search_strategy: 'turbo',
          freshness,
        },
      },
    }),
    signal,
  });
  if (!response.ok) {
    throw new Error(`DashScope search failed with HTTP ${response.status}`);
  }
  const payload: SearchPayload = await response.json();
  const results = normalizeResults(payload);
  const content = payload.output?.choices?.[0]?.message?.content ?? '';
  return { text: formatSearchText(content, results), results };
}
