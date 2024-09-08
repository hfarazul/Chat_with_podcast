import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function summarizeText(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant that summarizes podcast content. Please format your summary with proper structure, including:\n- Use <h3> tags for main headings\n- Use <strong> tags for important concepts\n- Use <p> tags for paragraphs\n- Use <ul> and <li> tags for lists if needed" },
      { role: "user", content: `Summarize the following podcast segment in a structured format with multiple paragraphs:\n\n${text}` }
    ]
  })
  return response.choices[0].message.content || ''
}

export async function POST(request: Request) {
  const { transcript } = await request.json()

  try {
    const segmentDuration = 15 * 60 // 15 minutes in seconds
    const words = transcript.split(' ')
    const wordsPerSegment = Math.ceil(words.length / (transcript.length / segmentDuration))
    const numSegments = Math.ceil(words.length / wordsPerSegment)

    const summaries = []
    for (let i = 0; i < numSegments; i++) {
      const startIndex = i * wordsPerSegment
      const endIndex = Math.min((i + 1) * wordsPerSegment, words.length)
      const segmentText = words.slice(startIndex, endIndex).join(' ')

      if (segmentText) {
        const summary = await summarizeText(segmentText)
        summaries.push({
          start_time: i * segmentDuration,
          end_time: Math.min((i + 1) * segmentDuration, transcript.length / (words.length / segmentDuration)),
          summary
        })
      }
    }

    return NextResponse.json({ summaries })
  } catch (error) {
    console.error('An error occurred:', error)
    return NextResponse.json({ error: `An error occurred: ${(error as Error).message}` }, { status: 500 })
  }
}
