import type { AISettings } from '@/store/types';
import { chunkDocument } from './documentStore';
import { cosineSimilarity, embedTexts, resolveEmbeddingConfig } from './embedChunks';
import type { KnowledgeChunk, KnowledgeDocument, RetrievalResult, RetrievedChunk } from './types';

interface EmbeddingCacheEntry {
  docText: string;
  model: string;
  vectors: number[][];
}

// Chunk vectors per document, invalidated when the text or model changes.
// Session-scoped like the documents themselves.
const embeddingCache = new Map<string, EmbeddingCacheEntry>();
export const MIN_EMBEDDING_RELEVANCE = 0.45;

function keywordTerms(query: string): string[] {
  const terms = new Set<string>();
  for (const match of query.toLowerCase().match(/[a-z0-9]{2,}/g) ?? []) {
    terms.add(match);
  }
  // CJK has no word boundaries; bigrams are the standard cheap tokenizer.
  const cjk = query.match(/[一-鿿]/g) ?? [];
  for (let i = 0; i < cjk.length - 1; i += 1) {
    terms.add(cjk[i] + cjk[i + 1]);
  }
  return [...terms];
}

export function keywordRetrieve(
  query: string,
  chunks: KnowledgeChunk[],
  topK: number
): RetrievedChunk[] {
  const terms = keywordTerms(query);
  const scored = chunks.map((chunk) => {
    const haystack = chunk.text.toLowerCase();
    let score = 0;
    for (const term of terms) {
      let cursor = haystack.indexOf(term);
      while (cursor !== -1) {
        score += 1;
        cursor = haystack.indexOf(term, cursor + term.length);
      }
    }
    return { ...chunk, score };
  });
  return scored
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

async function embeddingRetrieve(
  query: string,
  doc: KnowledgeDocument,
  chunks: KnowledgeChunk[],
  topK: number,
  settings: AISettings,
  signal: AbortSignal
): Promise<RetrievedChunk[] | null> {
  const config = resolveEmbeddingConfig(settings);
  if (!config) {
    return null;
  }

  const cached = embeddingCache.get(doc.id);
  let vectors = cached?.vectors;
  if (!cached || cached.docText !== doc.text || cached.model !== config.model) {
    vectors = await embedTexts(
      chunks.map((chunk) => chunk.text),
      config,
      signal
    );
    embeddingCache.set(doc.id, { docText: doc.text, model: config.model, vectors });
  }

  const [queryVector] = await embedTexts([query], config, signal);
  return chunks
    .map((chunk, index) => ({
      ...chunk,
      score: cosineSimilarity(queryVector, vectors![index]),
    }))
    .filter((chunk) => chunk.score >= MIN_EMBEDDING_RELEVANCE)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Embedding retrieval when the BYOK endpoint supports it, keyword matching
// otherwise — the workflow keeps producing context either way.
export async function retrieveTopK(
  query: string,
  doc: KnowledgeDocument,
  topK: number,
  settings: AISettings,
  signal: AbortSignal,
  onDegrade?: (reason: string) => void
): Promise<RetrievalResult> {
  const chunks = chunkDocument(doc);

  try {
    const retrieved = await embeddingRetrieve(query, doc, chunks, topK, settings, signal);
    if (retrieved) {
      return { chunks: retrieved, method: 'embedding' };
    }
    onDegrade?.('no embedding endpoint for the configured provider');
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }
    onDegrade?.(error instanceof Error ? error.message : String(error));
  }

  return { chunks: keywordRetrieve(query, chunks, topK), method: 'keyword' };
}
