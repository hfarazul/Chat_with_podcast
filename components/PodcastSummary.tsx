'use client'

import { useState } from 'react'
import TranscribeForm from './TranscribeForm'
import SummaryBox from './SummaryBox'
import ChatBox from './ChatBox'
import TranscriptBox from './TranscriptBox'

export interface Summary {
  start_time: number;
  end_time: number;
  summary: string;
}

export default function PodcastSummary() {
  const [transcript, setTranscript] = useState<string>('')
  const [summaries, setSummaries] = useState<Summary[]>([])

  const handleTranscribe = async (youtubeUrl: string) => {
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtube_url: youtubeUrl }),
      })
      const data = await response.json()
      setTranscript(data.transcript)

      // Generate summary using OpenAI
      const summaryResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: data.transcript }),
      })
      const summaryData = await summaryResponse.json()
      setSummaries(summaryData.summaries)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-grow">
      <p className="text-center text-gray-600 mb-8">Transform your podcast into an interactive experience</p>

      <TranscribeForm onTranscribe={handleTranscribe} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <SummaryBox summaries={summaries} />
        <ChatBox transcript={transcript} />
      </div>

      <TranscriptBox transcript={transcript} />
    </div>
  )
}
