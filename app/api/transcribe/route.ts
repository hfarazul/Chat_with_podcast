import { NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function getVideoId(url: string): string | null {
  const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/)
  return videoIdMatch ? videoIdMatch[1] : null
}

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
  const { youtube_url } = await request.json()
  const videoId = getVideoId(youtube_url)

  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId)
    const textTranscript = transcript.map(t => t.text).join(' ')

    const totalDuration = transcript[transcript.length - 1].offset + transcript[transcript.length - 1].duration
    const segmentDuration = 15 * 60 // 15 minutes in seconds
    const numSegments = Math.ceil(totalDuration / segmentDuration)

    const summaries = []
    for (let i = 0; i < numSegments; i++) {
      const startTime = i * segmentDuration
      const endTime = Math.min((i + 1) * segmentDuration, totalDuration)
      const segmentText = transcript
        .filter(t => startTime <= t.offset && t.offset < endTime)
        .map(t => t.text)
        .join(' ')

      if (segmentText) {
        const summary = await summarizeText(segmentText)
        summaries.push({
          start_time: startTime,
          end_time: endTime,
          summary
        })
      }
    }

    return NextResponse.json({
      transcript: textTranscript,
      summaries
    })
  } catch (error) {
    console.error('An error occurred:', error)
    return NextResponse.json({ error: `An error occurred: ${(error as Error).message}` }, { status: 500 })
  }
}
