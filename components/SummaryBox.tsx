import ReactMarkdown from 'react-markdown'

interface SummaryBoxProps {
  summary: string;
}

export default function SummaryBox({ summary }: SummaryBoxProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-800">Summary</h2>
      <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded-md">
        {summary ? (
          <ReactMarkdown
            components={{
              h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
              p: ({node, ...props}) => <p className="mb-4" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
            }}
          >
            {summary.replace(/<\/?h3>|<\/?strong>|<\/?p>|<\/?ul>|<\/?li>/g, (match) => {
              const replacements: {[key: string]: string} = {
                '<h3>': '### ',
                '</h3>': '\n\n',
                '<strong>': '**',
                '</strong>': '**',
                '<p>': '',
                '</p>': '\n\n',
                '<ul>': '',
                '</ul>': '\n',
                '<li>': '- ',
                '</li>': '\n'
              };
              return replacements[match] || match;
            })}
          </ReactMarkdown>
        ) : (
          <div className="text-gray-500">No summary available yet.</div>
        )}
      </div>
    </div>
  )
}
