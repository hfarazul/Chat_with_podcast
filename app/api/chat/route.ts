import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function getChatResponse(transcript: string, question: string): Promise<string> {
  const systemPrompt = `You are an AI assistant tasked with answering questions about a podcast.
  Your answers should be:
  - Very very important instruction for you: Strictly based on the podcast content, if the question asked is not relevant to the podcast, or it was not discussed, answer that the topic was not covered.
  - Crisp and precise
  - Include the tone of the speaker when relevant

  Format your responses with:
  - Use <h3> tags for main headings
  - Use <strong> tags for important concepts
  - Use <p> tags for paragraphs
  - Use <ul> and <li> tags for lists if needed

  If the answer is not in the podcast content, say so politely.`

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Podcast content: ${transcript}\n\nQuestion: ${question}` }
    ]
  })
  return response.choices[0].message.content || ''
}

export async function POST(request: Request) {
  const { transcript, question } = await request.json()

  try {
    const answer = await getChatResponse(transcript, question)
    return NextResponse.json({ answer })
  } catch (error) {
    console.error('An error occurred during chat:', error)
    return NextResponse.json({ error: `An error occurred: ${(error as Error).message}` }, { status: 500 })
  }
}
