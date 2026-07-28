import { embedMany, cosineSimilarity } from 'ai';
import { google } from '@ai-sdk/google';
import type { ResumeChunk } from './chunk';

const EMBEDDING_MODEL = google.embedding('gemini-embedding-001');

export type EmbeddedChunk = {
  chunk: ResumeChunk;
  embedding: number[];
};

export async function embedResumeChunks(chunks: ResumeChunk[]): Promise<EmbeddedChunk[]> {
  const { embeddings } = await embedMany({
    model: EMBEDDING_MODEL,
    values: chunks.map((chunk) => chunk.text),
    providerOptions: {
      google: { taskType: 'RETRIEVAL_DOCUMENT' },
    },
  });

  return chunks.map((chunk, i) => ({ chunk, embedding: embeddings[i] }));
}

export async function embedRequirementQueries(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: EMBEDDING_MODEL,
    values: texts,
    providerOptions: {
      google: { taskType: 'RETRIEVAL_QUERY' },
    },
  });
  return embeddings;
}

export function retrieveTopK(
  queryEmbedding: number[],
  embeddedChunks: EmbeddedChunk[],
  k: number,
): Array<{ chunk: ResumeChunk; score: number }> {
  return embeddedChunks
    .map(({ chunk, embedding }) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
