import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AISettings } from '@/store/types';
import { resolveDashScopeSearchEndpoint, searchWithDashScope } from './dashScopeSearch';

const SETTINGS: AISettings = {
  provider: 'custom',
  storageMode: 'local',
  apiKey: 'test-key',
  model: 'qwen-plus',
  customBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
};

afterEach(() => vi.unstubAllGlobals());

describe('DashScope workflow search', () => {
  it('resolves the native endpoint only for DashScope custom providers', () => {
    expect(resolveDashScopeSearchEndpoint(SETTINGS)).toBe(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
    );
    expect(resolveDashScopeSearchEndpoint({ ...SETTINGS, provider: 'openai' })).toBeNull();
    expect(
      resolveDashScopeSearchEndpoint({ ...SETTINGS, customBaseUrl: 'https://example.com/v1' })
    ).toBeNull();
  });

  it('returns cited source results with the requested freshness', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        output: {
          choices: [{ message: { content: '近期动态[ref_1]' } }],
          search_info: {
            search_results: [
              { title: '发布说明', url: 'https://example.com/release', site_name: 'Example' },
            ],
          },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await searchWithDashScope(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      SETTINGS,
      '最近动态',
      7,
      new AbortController().signal
    );

    expect(result.results).toEqual([
      {
        title: '发布说明',
        snippet: '发布说明',
        url: 'https://example.com/release',
        siteName: 'Example',
      },
    ]);
    expect(result.text).toContain('[发布说明](https://example.com/release)');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"freshness":7'),
      })
    );
  });

  it('returns empty text when the provider supplies no reliable sources', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ output: { choices: [{ message: { content: 'model memory' } }] } }),
      })
    );

    await expect(
      searchWithDashScope(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        SETTINGS,
        'unknown',
        30,
        new AbortController().signal
      )
    ).resolves.toEqual({ text: '', results: [] });
  });

  it('surfaces provider HTTP failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }));
    await expect(
      searchWithDashScope(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        SETTINGS,
        'latest',
        30,
        new AbortController().signal
      )
    ).rejects.toThrow('HTTP 429');
  });
});
