'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface UploadResponse {
  success: boolean
  message: string
  folder_name?: string
  uploaded_files?: Array<{
    filename: string
    s3_url: string
    size: number
  }>
  total_size?: number
  upload_time?: number
  failed_files?: Array<{
    filename: string
    error: string
  }>
}

export function S3UploadContent() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [s3BucketUrl, setS3BucketUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [response, setResponse] = useState<UploadResponse | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files)
      setResponse(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!files || files.length === 0) {
      toast.error('Please select at least one file to upload')
      return
    }

    if (!s3BucketUrl.trim()) {
      toast.error('Please enter S3 bucket URL')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setResponse(null)

    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append('files', file)
    })
    formData.append('s3_bucket_url', s3BucketUrl)

    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(Math.round(percentComplete))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText)
          setResponse(result)
          if (result.failed_files && result.failed_files.length > 0) {
            toast.success(`Uploaded ${result.uploaded_files?.length || 0} files. ${result.failed_files.length} failed.`)
          } else {
            toast.success(`Successfully uploaded ${result.uploaded_files?.length || 0} file(s)!`)
          }
        } else {
          const error = JSON.parse(xhr.responseText)
          toast.error(error.message || 'Upload failed')
        }
        setUploading(false)
      })

      xhr.addEventListener('error', () => {
        toast.error('Network error occurred during upload')
        setUploading(false)
      })

      xhr.open('POST', '/api/s3-upload')
      xhr.send(formData)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">S3 File Upload</h1>
          <p className="text-slate-600">Upload files to AWS S3 bucket with progress tracking</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 mb-2">
                Select Files (Multiple)
              </label>
              <div className="relative">
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-teal-50 file:text-teal-700
                    hover:file:bg-teal-100
                    disabled:opacity-50 disabled:cursor-not-allowed
                    cursor-pointer"
                />
              </div>
              {files && files.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium text-slate-700">
                    Selected {files.length} file(s):
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {Array.from(files).map((file, index) => (
                      <p key={index} className="text-xs text-slate-600 pl-2">
                        • {file.name} ({formatFileSize(file.size)})
                      </p>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    Total: {formatFileSize(Array.from(files).reduce((acc, f) => acc + f.size, 0))}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="s3-bucket-url" className="block text-sm font-medium text-slate-700 mb-2">
                S3 Bucket URL
              </label>
              <input
                id="s3-bucket-url"
                type="text"
                value={s3BucketUrl}
                onChange={(e) => setS3BucketUrl(e.target.value)}
                disabled={uploading}
                placeholder="e.g., s3://bucket-name/path/to/folder"
                className="block w-full px-4 py-2 border border-slate-300 rounded-lg
                  focus:ring-2 focus:ring-teal-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                  text-slate-900 placeholder-slate-400"
              />
              <p className="mt-1 text-xs text-slate-500">
                Enter the S3 bucket path. Files will be uploaded to a timestamped folder (e.g., path/2026-03-06_18-30-45/)
              </p>
            </div>

            {uploading && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Upload Progress</span>
                  <span className="text-sm font-semibold text-teal-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div
                    className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !files || files.length === 0 || !s3BucketUrl.trim()}
              className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold
                hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200"
            >
              {uploading ? 'Uploading...' : `Upload ${files ? files.length : 0} File(s) to S3`}
            </button>
          </form>
        </div>

        {response && (
          <div className={`mt-6 rounded-lg border p-6 ${
            response.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {response.success ? (
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${
                  response.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {response.success ? 'Upload Successful' : 'Upload Failed'}
                </h3>
                <div className={`mt-2 text-sm ${
                  response.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  <p className="mb-2">{response.message}</p>
                  {response.success && response.uploaded_files && response.uploaded_files.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <p className="font-medium">Upload Details:</p>
                      {response.folder_name && (
                        <p>
                          <span className="font-semibold">Folder:</span> {response.folder_name}
                        </p>
                      )}
                      <div className="bg-white bg-opacity-50 rounded p-3 max-h-48 overflow-y-auto">
                        <p className="font-semibold mb-2">Uploaded Files ({response.uploaded_files.length}):</p>
                        {response.uploaded_files.map((file, index) => (
                          <div key={index} className="text-xs mb-1 pl-2">
                            <p className="font-medium">{file.filename}</p>
                            <p className="text-green-600 break-all">{file.s3_url}</p>
                            <p>Size: {formatFileSize(file.size)}</p>
                          </div>
                        ))}
                      </div>
                      {response.total_size && (
                        <p>
                          <span className="font-semibold">Total Size:</span> {formatFileSize(response.total_size)}
                        </p>
                      )}
                      {response.upload_time && (
                        <p>
                          <span className="font-semibold">Upload Time:</span> {response.upload_time.toFixed(2)}s
                        </p>
                      )}
                      {response.failed_files && response.failed_files.length > 0 && (
                        <div className="bg-red-100 rounded p-3 mt-2">
                          <p className="font-semibold text-red-800 mb-2">Failed Files ({response.failed_files.length}):</p>
                          {response.failed_files.map((file, index) => (
                            <div key={index} className="text-xs mb-1 pl-2 text-red-700">
                              <p className="font-medium">{file.filename}</p>
                              <p>Error: {file.error}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-slate-50 rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Configuration Requirements</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <p>• Ensure AWS credentials are configured in environment variables:</p>
            <ul className="ml-6 space-y-1 list-disc">
              <li><code className="bg-slate-200 px-2 py-0.5 rounded">AWS_REGION</code></li>
              <li><code className="bg-slate-200 px-2 py-0.5 rounded">ACCESS_KEY</code></li>
              <li><code className="bg-slate-200 px-2 py-0.5 rounded">SECRET_KEY</code></li>
            </ul>
            <p className="mt-3">• Files are uploaded with AES256 server-side encryption</p>
            <p>• Large files use multipart upload for better reliability</p>
            <p>• Multiple files are organized in timestamped folders (YYYY-MM-DD_HH-MM-SS)</p>
          </div>
        </div>
      </div>
  )
}
