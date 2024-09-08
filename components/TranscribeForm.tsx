import { useState } from 'react'

interface TranscribeFormProps {
  onTranscribe: (youtubeUrl: string) => void;
}

export default function TranscribeForm({ onTranscribe }: TranscribeFormProps) {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onTranscribe(youtubeUrl)
  }

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={youtubeUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYoutubeUrl(e.target.value)}
          placeholder="Enter YouTube URL of the podcast"
          className="flex-grow px-4 py-2 rounded-md border-2 border-indigo-300 focus:border-indigo-500 focus:outline-none shadow-sm"
        />
        <button
          type="submit"
          className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition duration-300 shadow-sm"
        >
          Process Podcast
        </button>
      </form>
    </div>
  )
}
