import OpenAI from "openai";
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI();

export interface Chunk {
  text: string;
  embedding: number[];
}

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}

export async function preprocessTranscript(transcript: string): Promise<{ id: string, chunks: Chunk[] }> {
  const chunkSize = 300;
  const overlap = 50;
  const words = transcript.split(/\s+/);
  const chunks: Chunk[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunkText = words.slice(i, i + chunkSize).join(' ');
    const embedding = await getEmbedding(chunkText);
    chunks.push({ text: chunkText, embedding });
    await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
  }

  const id = uuidv4();
  return { id, chunks };
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function findRelevantChunks(question: string, chunks: Chunk[], topK: number = 5): Promise<string> {
  const questionEmbedding = await getEmbedding(question);
  const similarities = chunks.map(chunk => ({
    text: chunk.text,
    similarity: cosineSimilarity(questionEmbedding, chunk.embedding)
  }));
  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities.slice(0, topK).map(s => s.text).join(' ');
}
