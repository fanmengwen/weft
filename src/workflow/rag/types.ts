export interface KnowledgeDocument {
  id: string;
  name: string;
  text: string;
  source: 'builtin' | 'upload';
}

export interface KnowledgeChunk {
  id: string;
  docId: string;
  index: number;
  text: string;
}

export interface RetrievedChunk extends KnowledgeChunk {
  score: number;
}

export type RetrievalMethod = 'embedding' | 'keyword';

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  method: RetrievalMethod;
}
