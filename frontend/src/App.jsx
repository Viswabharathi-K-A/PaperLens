import { useState } from 'react'
import UploadZone from './components/UploadZone'
import DocList from './components/DocList'
import ChatPanel from './components/ChatPanel'

function App() {
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [refreshDocs, setRefreshDocs] = useState(0)

  const handleUploadSuccess = () => {
    setRefreshDocs(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">📄 PaperLens</h1>
        <p className="text-sm text-gray-500">Upload a research paper and ask questions</p>
      </header>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="col-span-1 space-y-4">
          <UploadZone onUploadSuccess={handleUploadSuccess} />
          <DocList
            onSelectDoc={setSelectedDoc}
            selectedDoc={selectedDoc}
            refresh={refreshDocs}
          />
        </div>

        {/* Main chat area */}
        <div className="col-span-2">
          <ChatPanel selectedDoc={selectedDoc} />
        </div>
      </div>
    </div>
  )
}

export default App