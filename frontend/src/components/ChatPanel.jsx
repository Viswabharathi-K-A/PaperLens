import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { queryDocument } from '../api'

export default function ChatPanel({ selectedDoc }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!question.trim() || !selectedDoc) return

    const userMessage = { role: 'user', content: question }
    setMessages(prev => [...prev, userMessage])
    setQuestion('')
    setLoading(true)

    try {
      const res = await queryDocument(question, selectedDoc.id)
      const botMessage = {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources
      }
      setMessages(prev => [...prev, botMessage])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Something went wrong. Try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        {selectedDoc ? (
          <p className="text-sm font-medium text-gray-700">
            💬 Chatting with: <span className="text-blue-500">{selectedDoc.filename}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-400">Select a document to start chatting</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-300 text-sm mt-20">
            Ask anything about your document
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm
              ${msg.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800'}`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
              {msg.sources && (
                <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                  {msg.sources.map((s, j) => (
                    <p key={j} className="text-xs text-gray-400">
                      Source {j + 1} · score: {s.score.toFixed(2)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl px-4 py-2 text-sm text-gray-500">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedDoc ? "Ask a question..." : "Select a document first"}
          disabled={!selectedDoc}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm
            focus:outline-none focus:border-blue-400 disabled:bg-gray-50"
        />
        <button
          onClick={handleAsk}
          disabled={!selectedDoc || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm
            hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ask
        </button>
      </div>
    </div>
  )
}