import { NextResponse } from 'next/server'
import OpenAI from "openai";
import { preprocessTranscript, Chunk } from '../../utils/embeddingUtils';

const openai = new OpenAI();

async function summarizeWithGPT4(context: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes podcast content. Please format your summary with proper structure, including <h3> tags for main headings, <strong> tags for important concepts, <p> tags for paragraphs, and <ul> and <li> tags for lists if needed. Your summary should be concise and capture the main points." },
        { role: "user", content: `Summarize the following chunk of podcast transcript:\n\n${context}\n\nSummary:` }
      ],
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
    });

    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error('Error in summarizeWithGPT4:', error);
    throw error;
  }
}

async function createFinalSummary(summaries: string[]): Promise<string> {
  const context = summaries.join('\n\n');
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that creates a final summary of podcast content based on multiple chunk summaries. Please format your summary with proper structure, including <h3> tags for main headings, <strong> tags for important concepts, <p> tags for paragraphs, and <ul> and <li> tags for lists if needed. Your summary should be concise and capture the main points." },
        { role: "user", content: `Create a final summary of no more than 900 words based on these chunk summaries:\n\n${context}\n\nFinal Summary:` }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      top_p: 0.9,
    });

    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error('Error in createFinalSummary:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { transcript, chunks } = await request.json();

    let processedChunks: Chunk[];
    if (chunks) {
      processedChunks = chunks;
    } else {
      const { chunks: newChunks } = await preprocessTranscript(transcript);
      processedChunks = newChunks;
    }

    const chunkSummaries = await Promise.all(processedChunks.map(chunk => summarizeWithGPT4(chunk.text)));
    const finalSummary = await createFinalSummary(chunkSummaries);

    return NextResponse.json({ summary: finalSummary, chunks: processedChunks });
  } catch (error) {
    console.error('An error occurred:', error);
    return NextResponse.json({ error: `An error occurred: ${(error as Error).message}` }, { status: 500 });
  }
}
