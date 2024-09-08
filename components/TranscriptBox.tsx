interface TranscriptBoxProps {
  transcript: string;
}

export default function TranscriptBox({ transcript }: TranscriptBoxProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-800">Transcript</h2>
      <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded-md">
        {transcript ? (
          transcript.split('\n').map((line, index) => (
            <p key={index} className="mb-2">
              {line}
            </p>
          ))
        ) : (
          <div className="text-gray-500">No transcript available yet.</div>
        )}
      </div>
    </div>
  )
}
