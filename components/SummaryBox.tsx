import ReactMarkdown from 'react-markdown'

interface SummaryBoxProps {
  summary: string;
}

export default function SummaryBox({ summary }: SummaryBoxProps) {
  // Function to clean up the summary text and convert HTML to markdown
  const cleanSummary = (text: string) => {
    return text
      .replace(/<h3>/g, '### ')
      .replace(/<\/h3>/g, '\n\n')
      .replace(/<strong>/g, '**')
      .replace(/<\/strong>/g, '**')
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<ul>/g, '')
      .replace(/<\/ul>/g, '\n')
      .replace(/<li>/g, '- ')
      .replace(/<\/li>/g, '\n')
      .replace(/(\n|\r\n){3,}/g, '\n\n') // Replace triple or more newlines with double newlines
      .trim();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-800">Summary</h2>
      <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded-md">
        {summary ? (
          <ReactMarkdown
            components={{
              h3: ({...props}) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
              strong: ({...props}) => <strong className="font-bold" {...props} />,
              p: ({...props}) => <p className="mb-4" {...props} />,
              ul: ({...props}) => <ul className="list-disc list-inside mb-4" {...props} />,
              li: ({...props}) => <li className="mb-1" {...props} />,
            }}
          >
            {cleanSummary(summary)}
          </ReactMarkdown>
        ) : (
          <div className="text-gray-500">No summary available yet.</div>
        )}
      </div>
    </div>
  )
}
