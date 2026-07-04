import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AISettings } from '@/store/types';
import { chunkDocument } from './documentStore';
import { keywordRetrieve, retrieveTopK } from './retrieveTopK';
import type { KnowledgeDocument } from './types';

const DOC: KnowledgeDocument = {
  id: 'doc-test',
  name: 'test.md',
  source: 'upload',
  text: [
    '## 产品定位\nWeft 是一个 AI 驱动的可视化画布平台,支持图表与工作流两种模式。',
    '## 工作流模式\n工作流模式提供七种节点,支持条件分支和变量流动。',
    '## 隐私\n所有数据保留在浏览器本地,平台不存储任何密钥。',
  ].join('\n\n'),
};

function settings(overrides: Partial<AISettings> = {}): AISettings {
  return {
    provider: 'gemini',
    storageMode: 'local',
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('chunkDocument', () => {
  it('splits by paragraphs and keeps every chunk under the limit', () => {
    const chunks = chunkDocument(DOC);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.every((chunk) => chunk.text.length <= 400)).toBe(true);
    expect(chunks[0].docId).toBe(DOC.id);
  });

  it('hard-splits oversized paragraphs', () => {
    const longDoc: KnowledgeDocument = {
      ...DOC,
      id: 'doc-long',
      text: 'x'.repeat(1000),
    };
    const chunks = chunkDocument(longDoc);
    expect(chunks.length).toBe(3);
    expect(chunks.every((chunk) => chunk.text.length <= 400)).toBe(true);
  });
});

describe('keywordRetrieve', () => {
  it('ranks chunks by CJK bigram hits', () => {
    const chunks = chunkDocument(DOC);
    const hits = keywordRetrieve('工作流的节点', chunks, 2);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].text).toContain('工作流模式');
  });

  it('returns nothing when no term matches', () => {
    const chunks = chunkDocument(DOC);
    expect(keywordRetrieve('quantum entanglement', chunks, 3)).toEqual([]);
  });
});

describe('retrieveTopK', () => {
  it('falls back to keyword matching when no embedding endpoint exists', async () => {
    const degradations: string[] = [];
    const result = await retrieveTopK(
      '工作流',
      DOC,
      2,
      settings(),
      new AbortController().signal,
      (reason) => degradations.push(reason)
    );

    expect(result.method).toBe('keyword');
    expect(degradations).toHaveLength(1);
    expect(result.chunks[0]?.text).toContain('工作流');
  });

  it('uses embeddings when the endpoint responds', async () => {
    const chunkCount = chunkDocument(DOC).length;
    const fetchMock = vi.fn().mockImplementation(async (_url, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { input: string[] };
      return {
        ok: true,
        json: async () => ({
          data: body.input.map((text, index) => ({
            index,
            // Chunks mentioning 工作流 point one way, everything else the other,
            // so the query vector [1, 0] must rank the workflow chunk first.
            embedding: text.includes('工作流') || text === 'query' ? [1, 0] : [0, 1],
          })),
        }),
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await retrieveTopK(
      'query',
      { ...DOC, id: 'doc-embed' },
      1,
      settings({ provider: 'custom', apiKey: 'k', customBaseUrl: 'https://example.com/v1' }),
      new AbortController().signal
    );

    expect(result.method).toBe('embedding');
    expect(result.chunks).toHaveLength(1);
    expect(result.chunks[0].text).toContain('工作流');
    // One batched call for all chunks (≤10) plus one for the query.
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('https://example.com/v1/embeddings');
    expect(chunkCount).toBeLessThanOrEqual(10);
  });

  it('degrades to keyword matching when the endpoint fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const degradations: string[] = [];
    const result = await retrieveTopK(
      '节点',
      { ...DOC, id: 'doc-fail' },
      2,
      settings({ provider: 'custom', apiKey: 'k', customBaseUrl: 'https://example.com/v1' }),
      new AbortController().signal,
      (reason) => degradations.push(reason)
    );

    expect(result.method).toBe('keyword');
    expect(degradations[0]).toContain('500');
  });
});
