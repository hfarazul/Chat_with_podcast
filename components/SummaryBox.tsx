interface SummaryBoxProps {
  summary: string;
}

export default function SummaryBox({ summary }: SummaryBoxProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-800">Summary</h2>
      <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded-md">
        {summary ? (
          <div
            className="space-y-4"
            dangerouslySetInnerHTML={{ __html: summary }}
          />
        ) : (
          <div className="text-gray-500">No summary available yet.</div>
        )}
      </div>
    </div>
  )
}
