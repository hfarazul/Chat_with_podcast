import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function summarizeText(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a helpful assistant that summarizes podcast content. Please format your summary with proper structure, including:\n- Use <h3> tags for main headings\n- Use <strong> tags for important concepts\n- Use <p> tags for paragraphs\n- Use <ul> and <li> tags for lists if needed\n\nYour summary should be no more than 900 words." },
      { role: "user", content: `Summarize the following podcast transcript in a structured format with multiple paragraphs. The summary should be no more than 900 words:\n\n${text}` }
    ],
    max_tokens: 1500 // Approximately 900 words
  })
  return response.choices[0].message.content || ''
}

export async function POST(request: Request) {
  const { transcript } = await request.json()

  try {
    const summary = await summarizeText(transcript)
    return NextResponse.json({ summary })
  } catch (error) {
    console.error('An error occurred:', error)
    return NextResponse.json({ error: `An error occurred: ${(error as Error).message}` }, { status: 500 })
  }
}
