import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBoxProps {
  transcript: string;
}

export default function ChatBox({ transcript }: ChatBoxProps) {
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [question, setQuestion] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!question.trim()) return

    const newMessage: Message = { role: 'user', content: question }
    setChatHistory([...chatHistory, newMessage])
    setQuestion('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript, question }),
      })
      const data = await response.json()
      setChatHistory([...chatHistory, newMessage, { role: 'assistant', content: data.answer }])
    } catch (error) {
      console.error('Error:', error)
      setChatHistory([...chatHistory, newMessage, { role: 'assistant', content: 'Error occurred while processing your question.' }])
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-800">Chat with the Podcast</h2>
      <div className="h-72 overflow-y-auto bg-gray-50 p-4 rounded-md mb-4">
        {chatHistory.map((message, index) => (
          <div key={index} className="mb-4">
            <p className={`font-semibold ${message.role === 'user' ? 'text-indigo-600' : 'text-green-600'}`}>
              {message.role === 'user' ? 'You:' : 'Podcast AI:'}
            </p>
            <ReactMarkdown
              className="ml-4"
              components={{
                h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                p: ({node, ...props}) => <p className="mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
              }}
            >
              {message.content.replace(/<\/?h3>|<\/?strong>|<\/?p>|<\/?ul>|<\/?li>/g, (match) => {
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
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={question}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
          placeholder="Ask a question about the podcast"
          className="flex-grow px-4 py-2 rounded-md border-2 border-indigo-300 focus:border-indigo-500 focus:outline-none shadow-sm"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition duration-300 shadow-sm"
        >
          Send
        </button>
      </form>
    </div>
  )
}
