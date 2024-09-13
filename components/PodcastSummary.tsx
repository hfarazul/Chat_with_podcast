'use client'

import { useState, useEffect } from 'react'
import TranscribeForm from './TranscribeForm'
import SummaryBox from './SummaryBox'
import ChatBox from './ChatBox'
import TranscriptBox from './TranscriptBox'

interface Chunk {
  text: string;
  embedding: number[];
}

export default function PodcastSummary() {
  const [transcript, setTranscript] = useState<string>('')
  const [summary, setSummary] = useState<string>('')
  const [chunks, setChunks] = useState<Chunk[] | null>(null)

  useEffect(() => {
    const storedChunks = localStorage.getItem('podcastChunks')
    if (storedChunks) {
      setChunks(JSON.parse(storedChunks))
    }
  }, [])

  const clearChunks = () => {
    setChunks(null)
    localStorage.removeItem('podcastChunks')
  }

  const handleTranscribe = async (youtubeUrl: string) => {
    try {
      // Clear existing chunks when a new YouTube link is provided
      clearChunks()

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
      setSummary(summaryData.summary)
      if (summaryData.chunks) {
        setChunks(summaryData.chunks)
        localStorage.setItem('podcastChunks', JSON.stringify(summaryData.chunks))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAsk = async (question: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript, question, chunks }),
      })
      const data = await response.json()
      if (data.chunks) {
        setChunks(data.chunks)
        localStorage.setItem('podcastChunks', JSON.stringify(data.chunks))
      }
      return data.answer
    } catch (error) {
      console.error('Error:', error)
      return 'Error occurred while processing your question.'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-grow">
      <p className="text-center text-gray-600 mb-8">Transform your podcast into an interactive experience</p>

      <TranscribeForm onTranscribe={handleTranscribe} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <SummaryBox summary={summary} />
        <ChatBox transcript={transcript} onAsk={handleAsk} />
      </div>

      <TranscriptBox transcript={transcript} />
    </div>
  )
}
