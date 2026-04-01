import { useEffect, useState } from 'react'
import { getDocuments } from '../api'

export default function DocList({ onSelectDoc, selectedDoc, refresh }) {
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    fetchDocs()
  }, [refresh])

  const fetchDocs = async () => {
    try {
      const res = await getDocuments()
      setDocuments(res.data.documents)
    } catch (err) {
      console.error('Failed to fetch documents')
    }
  }

  const statusColor = (status) => {
    if (status === 'ready') return 'text-green-500'
    if (status === 'indexing') return 'text-yellow-500'
    return 'text-gray-400'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Your Documents</h2>
      {documents.length === 0 ? (
        <p className="text-xs text-gray-400">No documents yet</p>
      ) : (
        <ul className="space-y-2">
          {documents.map(doc => (
            <li
              key={doc.id}
              onClick={() => doc.status === 'ready' && onSelectDoc(doc)}
              className={`p-2 rounded-lg text-sm cursor-pointer border transition
                ${selectedDoc?.id === doc.id
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-100 hover:border-blue-200'}`}
            >
              <p className="font-medium text-gray-700 truncate">{doc.filename}</p>
              <p className={`text-xs ${statusColor(doc.status)}`}>{doc.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}