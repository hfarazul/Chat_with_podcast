import { Summary } from './PodcastSummary'

interface SummaryBoxProps {
  summaries: Summary[];
}

export default function SummaryBox({ summaries }: SummaryBoxProps) {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-800">Summary</h2>
      <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded-md">
        {summaries.length > 0 ? (
          summaries.map((summary, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-bold mb-2 text-indigo-700">
                Summary ({formatTime(summary.start_time)} - {formatTime(summary.end_time)})
              </h3>
              <div
                className="space-y-4"
                dangerouslySetInnerHTML={{ __html: summary.summary }}
              />
            </div>
          ))
        ) : (
          <div className="text-gray-500">No summary available yet.</div>
        )}
      </div>
    </div>
  )
}
