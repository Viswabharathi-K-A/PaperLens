import { useDropzone } from 'react-dropzone'
import { useState } from 'react'
import { uploadDocument } from '../api'

export default function UploadZone({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setMessage('')

    try {
      await uploadDocument(file)
      setMessage('✅ Uploaded successfully!')
      onUploadSuccess()
    } catch (err) {
      setMessage('❌ Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Upload Document</h2>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-sm text-blue-500">Uploading...</p>
        ) : isDragActive ? (
          <p className="text-sm text-blue-500">Drop the PDF here...</p>
        ) : (
          <p className="text-sm text-gray-500">Drag & drop a PDF here, or click to select</p>
        )}
      </div>
      {message && <p className="text-xs mt-2 text-center">{message}</p>}
    </div>
  )
}