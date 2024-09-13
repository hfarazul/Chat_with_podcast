import { NextResponse } from 'next/server'
import OpenAI from "openai";
import { preprocessTranscript, findRelevantChunks, Chunk } from '../../utils/embeddingUtils';

const openai = new OpenAI();

async function chatWithGPT4(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an AI assistant tasked with answering questions about a podcast. Your answers should be strictly based on the podcast content. If the question asked is not relevant to the podcast or was not discussed, answer that the topic was not covered. Be crisp and precise, and include the tone of the speaker when relevant. Format your responses with <h3> tags for main headings, <strong> tags for important concepts, <p> tags for paragraphs, and <ul> and <li> tags for lists if needed. If the answer is not in the podcast content, say so politely." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
      top_p: 0.9,
    });

    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error('Error in chatWithGPT4:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { transcript, question, chunks } = await req.json();

    let processedChunks: Chunk[];
    if (chunks) {
      processedChunks = chunks;
    } else {
      const { chunks: newChunks } = await preprocessTranscript(transcript);
      processedChunks = newChunks;
    }

    const relevantContext = await findRelevantChunks(question, processedChunks);
    const prompt = `Here's the relevant part of the podcast transcript: ${relevantContext}\n\nQuestion: ${question}\n\nAnswer:`;

    const answer = await chatWithGPT4(prompt);

    return NextResponse.json({ answer, chunks: processedChunks });
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
