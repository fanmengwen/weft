import type { AISettings } from '@/store/types';

export interface EmbeddingConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

const OPENAI_BASE_URL = 'https://api.openai.com/v1';
// Batch limit follows DashScope text-embedding-v4 (max 10 inputs per call),
// the strictest of the supported endpoints.
const EMBEDDING_BATCH_SIZE = 10;

// Embeddings ride the same OpenAI-compatible BYOK endpoint as chat. Only the
// custom provider (e.g. DashScope) and openai expose one; every other
// provider degrades to keyword retrieval.
export function resolveEmbeddingConfig(settings: AISettings): EmbeddingConfig | null {
  if (!settings.apiKey) {
    return null;
  }
  if (settings.provider === 'custom' && settings.customBaseUrl) {
    return {
      baseUrl: settings.customBaseUrl.replace(/\/+$/, ''),
      apiKey: settings.apiKey,
      model: 'text-embedding-v4',
    };
  }
  if (settings.provider === 'openai') {
    return {
      baseUrl: OPENAI_BASE_URL,
      apiKey: settings.apiKey,
      model: 'text-embedding-3-small',
    };
  }
  return null;
}

export async function embedTexts(
  texts: string[],
  config: EmbeddingConfig,
  signal: AbortSignal
): Promise<number[][]> {
  const vectors: number[][] = [];
  for (let start = 0; start < texts.length; start += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(start, start + EMBEDDING_BATCH_SIZE);
    const response = await fetch(`${config.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({ model: config.model, input: batch }),
      signal,
    });
    if (!response.ok) {
      throw new Error(`embeddings request failed with HTTP ${response.status}`);
    }
    const payload = (await response.json()) as {
      data?: Array<{ index?: number; embedding?: number[] }>;
    };
    const data = payload.data ?? [];
    if (data.length !== batch.length) {
      throw new Error('embeddings response is missing vectors');
    }
    // The API may return entries out of order; index is authoritative.
    const ordered = [...data].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    for (const entry of ordered) {
      if (!Array.isArray(entry.embedding)) {
        throw new Error('embeddings response is missing vectors');
      }
      vectors.push(entry.embedding);
    }
  }
  return vectors;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
