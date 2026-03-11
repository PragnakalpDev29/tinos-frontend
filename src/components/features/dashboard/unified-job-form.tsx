'use client'

import { useState, useRef } from 'react'
import { jobService } from '@/lib/services/job.service'
import toast from 'react-hot-toast'
import { Info, ChevronRight, AlertTriangle, Clock, Upload, X, Pause, Play, Database } from 'lucide-react'
import * as tus from 'tus-js-client'

export function UnifiedPipelineForm() {
    const [formData, setFormData] = useState({
        job_name: '',
        s3_rna_bam: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [queueFull, setQueueFull] = useState<{ message: string; running: number; queued: number } | null>(null)
    const [files, setFiles] = useState<FileList | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [showUploadSection, setShowUploadSection] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadInstances, setUploadInstances] = useState<Map<string, tus.Upload>>(new Map())
    const [uploadStatuses, setUploadStatuses] = useState<Map<string, { progress: number; status: 'uploading' | 'paused' | 'completed' | 'error' }>>(new Map())
    const [completedUploads, setCompletedUploads] = useState<Map<string, { s3Url: string; folderPath: string }>>(new Map())
    const [uploadErrors, setUploadErrors] = useState<Map<string, string>>(new Map())

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files)
            // console.log('Files selected:', selectedFiles.length, selectedFiles.map(f => f.name)) // DEBUG: Uncomment for testing
            
            // Check file type validation only
            const invalidFiles = selectedFiles.filter(file => !file.name.toLowerCase().endsWith('.bam'))
            
            if (invalidFiles.length > 0) {
                toast.error(
                    `Invalid file type(s) detected.
Only .bam files are allowed.

Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`,
                    { 
                        duration: 5000,
                        style: {
                            maxWidth: '500px',
                            padding: '16px',
                            fontSize: '14px',
                            whiteSpace: 'pre-line',
                        },
                    }
                )
                e.target.value = ''
                return
            }
            
            // TESTING: To accept any file type, comment out the validation above and change accept=".bam" to accept="*"
            
            setFiles(e.target.files)
        }
    }

    const handleFileUpload = async () => {
        if (!files || files.length === 0) {
            toast.error(
                'Please select at least 2 BAM files to upload',
                {
                    style: {
                        maxWidth: '500px',
                        padding: '16px',
                        fontSize: '14px',
                    },
                }
            )
            return
        }

        if (files.length < 2) {
            toast.error(
                'Minimum 2 BAM files required for upload',
                {
                    style: {
                        maxWidth: '500px',
                        padding: '16px',
                        fontSize: '14px',
                    },
                }
            )
            return
        }

        const s3UploadPath = process.env.NEXT_PUBLIC_S3_RNA_BAM_UPLOAD_PATH || 'pragnakalp_rna_bam_uploads'
        setUploading(true)
        setUploadErrors(new Map()) // Clear previous errors
        
        const newUploadInstances = new Map<string, tus.Upload>()
        const newUploadStatuses = new Map<string, { progress: number; status: 'uploading' | 'paused' | 'completed' | 'error' }>()
        const newCompletedUploads = new Map<string, { s3Url: string; folderPath: string }>()
        
        // Generate a single timestamp folder for ALL files in this batch
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const seconds = String(now.getSeconds()).padStart(2, '0')
        const sharedTimestampFolder = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
        
        // console.log('\n🗂️  BATCH UPLOAD - All files will be stored in folder:', sharedTimestampFolder)
        
        // Upload files sequentially (one by one)
        const filesArray = Array.from(files)
        
        for (let i = 0; i < filesArray.length; i++) {
            const file = filesArray[i]
            // console.log(`Starting upload ${i + 1}/${filesArray.length}: ${file.name}`)
            
            try {
                await new Promise<void>((resolve, reject) => {
                    // console.log(`[UPLOAD DEBUG] Original filename: "${file.name}"`);
                    const encodedFilename = btoa(file.name);
                    // console.log(`[UPLOAD DEBUG] Base64 encoded filename: "${encodedFilename}"`);
                    // console.log(`[UPLOAD DEBUG] Decoded back (verification): "${atob(encodedFilename)}"`);
                    
                    const upload = new tus.Upload(file, {
                        endpoint: '/api/tus-upload',
                        metadata: {
                            filename: encodedFilename,
                            filetype: file.type || 'application/octet-stream',
                        },
                        headers: {
                            'x-s3-bucket-url': s3UploadPath,
                            'x-timestamp-folder': sharedTimestampFolder,
                        },
                        chunkSize: 4 * 1024 * 1024, // 4MB chunks
                        retryDelays: [0, 1000, 3000, 5000],
                        onError: (error) => {
                            console.error('Upload failed:', error)
                            newUploadStatuses.set(file.name, { progress: 0, status: 'error' })
                            setUploadStatuses(new Map(newUploadStatuses))
                            
                            // Store error message for tracking
                            const errorMsg = error.message || 'Unknown error'
                            const newErrors = new Map(uploadErrors)
                            newErrors.set(file.name, errorMsg)
                            setUploadErrors(newErrors)
                            
                            // Show detailed error in toast
                            toast.error(
                                `Upload Failed: ${file.name}\n\n${errorMsg}`,
                                {
                                    duration: 8000,
                                    style: {
                                        maxWidth: '600px',
                                        padding: '16px',
                                        fontSize: '14px',
                                        whiteSpace: 'pre-line',
                                    },
                                }
                            )
                            reject(error)
                        },
                        onProgress: (bytesUploaded, bytesTotal) => {
                            const progress = Math.round((bytesUploaded / bytesTotal) * 100)
                            newUploadStatuses.set(file.name, { progress, status: 'uploading' })
                            setUploadStatuses(new Map(newUploadStatuses))
                            
                            // Calculate overall progress based on completed files + current file
                            const completedFiles = i
                            const currentFileProgress = progress / 100
                            const totalProgress = ((completedFiles + currentFileProgress) / filesArray.length) * 100
                            setUploadProgress(Math.round(totalProgress))
                        },
                        onSuccess: async () => {
                            newUploadStatuses.set(file.name, { progress: 100, status: 'completed' })
                            setUploadStatuses(new Map(newUploadStatuses))
                            
                            // console.log(`\n========== UPLOAD SUCCESS: ${file.name} ==========`);
                            // console.log('Upload URL:', upload.url);
                            
                            // Try to get completion info from the upload URL with retry
                            try {
                                const uploadId = upload.url?.split('/').pop()
                                // console.log('Upload completed, getting completion info for:', uploadId, 'file:', file.name)
                                if (uploadId) {
                                    // Wait a bit for S3 metadata to be saved
                                    await new Promise(resolve => setTimeout(resolve, 500))
                                    
                                    // Retry up to 3 times
                                    let retries = 3
                                    let response = null
                                    let foundInfo = false
                                    
                                    while (retries > 0 && !foundInfo) {
                                        response = await fetch(`/api/tus-upload/${uploadId}`, {
                                            method: 'HEAD',
                                            headers: {
                                                'Tus-Resumable': '1.0.0',
                                            },
                                        })
                                        
                                        // console.log('Completion response status:', response.status, 'attempt:', 4 - retries)
                                        
                                        if (response.ok) {
                                            const s3Url = response.headers.get('S3-Url')
                                            const folderPath = response.headers.get('Folder-Path')
                                            const uploadComplete = response.headers.get('Upload-Complete')
                                            const fileName = response.headers.get('File-Name')
                                            
                                            // console.log('\n--- RESPONSE HEADERS ---');
                                            // console.log('S3-Url:', s3Url);
                                            // console.log('Folder-Path:', folderPath);
                                            // console.log('File-Name:', fileName);
                                            // console.log('Upload-Complete:', uploadComplete);
                                            // console.log('All headers:', Array.from(response.headers.entries()));
                                            
                                            if (s3Url && folderPath) {
                                                // console.log('\n✓ File stored at S3 URL:', s3Url);
                                                // console.log('✓ Folder path:', folderPath);
                                                // console.log('✓ File name in S3:', fileName);
                                                // console.log('✓ S3 URL ends with .bam:', s3Url.endsWith('.bam'));
                                                // console.log('✓ Extracted filename from S3 URL:', s3Url.split('/').pop());
                                                newCompletedUploads.set(file.name, { s3Url, folderPath })
                                                foundInfo = true
                                                break
                                            }
                                        }
                                        
                                        retries--
                                        if (retries > 0) {
                                            await new Promise(resolve => setTimeout(resolve, 1000))
                                        }
                                    }
                                    
                                    // Fallback: construct path from upload path if headers not available
                                    if (!foundInfo) {
                                        console.warn('⚠️ Could not get completion headers, using fallback path construction')
                                        const folderPath = s3UploadPath
                                        const s3Url = `s3://epicode-neoantigen/${folderPath}`
                                        // console.log('Fallback S3 URL:', s3Url);
                                        // console.log('Fallback folder path:', folderPath);
                                        newCompletedUploads.set(file.name, { s3Url, folderPath })
                                    }
                                }
                            } catch (error) {
                                console.error('❌ Failed to get upload completion info:', error)
                                // Fallback: use the upload path
                                const folderPath = s3UploadPath
                                const s3Url = `s3://epicode-neoantigen/${folderPath}`
                                // console.log('Error fallback S3 URL:', s3Url);
                                newCompletedUploads.set(file.name, { s3Url, folderPath })
                            }
                            
                            // console.log(`========== END UPLOAD: ${file.name} ==========\n`);
                            resolve()
                        },
                    })
                    
                    newUploadInstances.set(file.name, upload)
                    setUploadInstances(new Map(newUploadInstances))
                    
                    upload.start()
                })
                
                // console.log(`Completed upload ${i + 1}/${filesArray.length}: ${file.name}`)
            } catch (error) {
                console.error(`Failed to upload file ${i + 1}/${filesArray.length}: ${file.name}`, error)
                // Continue with next file even if current one fails
            }
        }
        
        // After all uploads complete, check if we have completion info
        // console.log('\n========================================');
        // console.log('ALL UPLOADS FINISHED');
        // console.log('========================================');
        // console.log('Total files uploaded:', newCompletedUploads.size);
        // console.log('\nDETAILED UPLOAD RESULTS:');
        // Array.from(newCompletedUploads.entries()).forEach(([filename, data]) => {
        //     console.log(`\nFile: ${filename}`);
        //     console.log(`  S3 URL: ${data.s3Url}`);
        //     console.log(`  Folder: ${data.folderPath}`);
        //     console.log(`  Has .bam extension: ${data.s3Url.endsWith('.bam')}`);
        // });
        // console.log('========================================\n');
        
        if (newCompletedUploads.size > 0) {
            // Use the first file's folder path for the S3 path
            const firstCompleted = Array.from(newCompletedUploads.values())[0]
            const s3Path = `s3://epicode-neoantigen/${firstCompleted.folderPath}`
            // console.log('\n📝 Setting S3 RNA BAM path in form:', s3Path)
            setFormData(prev => ({ ...prev, s3_rna_bam: s3Path }))
            setCompletedUploads(new Map(newCompletedUploads))
            
            toast.success(
                `✓ ${files.length} file(s) uploaded successfully!\nRNA BAM path auto-filled.`,
                {
                    duration: 5000,
                    style: {
                        maxWidth: '500px',
                        padding: '16px',
                        fontSize: '14px',
                        whiteSpace: 'pre-line',
                    },
                }
            )
            
            // Reset file input field
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            
            setShowUploadSection(false)
            setFiles(null)
        } else {
            // console.warn('Uploads completed but no S3 path information received')
            toast.success(
                `✓ ${files.length} file(s) uploaded successfully!\nPlease verify the S3 path below.`,
                {
                    duration: 5000,
                    style: {
                        maxWidth: '500px',
                        padding: '16px',
                        fontSize: '14px',
                        whiteSpace: 'pre-line',
                    },
                }
            )
            
            // Reset file input field
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            
            setFiles(null)
        }
        
        setUploading(false)
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const pauseUpload = (fileName: string) => {
        const upload = uploadInstances.get(fileName)
        if (upload) {
            upload.abort()
            const newStatuses = new Map(uploadStatuses)
            newStatuses.set(fileName, { ...newStatuses.get(fileName)!, status: 'paused' })
            setUploadStatuses(newStatuses)
        }
    }

    const resumeUpload = (fileName: string) => {
        const upload = uploadInstances.get(fileName)
        if (upload) {
            upload.start()
            const newStatuses = new Map(uploadStatuses)
            newStatuses.set(fileName, { ...newStatuses.get(fileName)!, status: 'uploading' })
            setUploadStatuses(newStatuses)
        }
    }

    const cancelUpload = (fileName: string) => {
        const upload = uploadInstances.get(fileName)
        if (upload) {
            upload.abort()
            const newInstances = new Map(uploadInstances)
            const newStatuses = new Map(uploadStatuses)
            newInstances.delete(fileName)
            newStatuses.delete(fileName)
            setUploadInstances(newInstances)
            setUploadStatuses(newStatuses)
            
            if (newInstances.size === 0) {
                setUploading(false)
                setUploadProgress(0)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.s3_rna_bam) {
            toast.error(
                'RNA BAM Path is required',
                {
                    style: {
                        maxWidth: '500px',
                        padding: '16px',
                        fontSize: '14px',
                    },
                }
            )
            return
        }

        setIsSubmitting(true)
        setQueueFull(null)  // Clear any previous queue-full banner
        try {
            const response = await jobService.submitPreprocessingJob(formData)
            toast.success(
                `✓ Pipeline Started Successfully!\n\nJob ID: ${response.jobId}\n\nStage 2 will trigger automatically upon Stage 1 completion.`,
                { 
                    duration: 6000,
                    style: {
                        maxWidth: '500px',
                        padding: '16px',
                        fontSize: '14px',
                        whiteSpace: 'pre-line',
                    },
                }
            )
            setFormData({ job_name: '', s3_rna_bam: '' })
        } catch (error: any) {
            const errData = error?.response?.data
            if (errData?.error === 'queue_full') {
                // Show specific queue-full banner
                setQueueFull({
                    message: errData.message,
                    running: errData.running ?? 0,
                    queued: errData.queued ?? 0,
                })
            } else {
                const errorMessage = errData?.error || errData?.message || error?.message || 'Failed to start pipeline'
                toast.error(
                    errorMessage,
                    {
                        style: {
                            maxWidth: '500px',
                            padding: '16px',
                            fontSize: '14px',
                            whiteSpace: 'pre-line',
                        },
                    }
                )
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const jobNamePlaceholder = formData.job_name || 'auto-YYYYMMDD-HHMMSS'

    return (
        <div className="max-w-6xl mx-auto space-y-8">

            {/* ── Queue Full Banner ── */}
            {queueFull && (
                <div className="flex items-start gap-4 bg-amber-50 border border-amber-300 rounded-xl p-5 shadow-sm">
                    <div className="flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-amber-900 text-base">Compute Queue is Currently Full</p>
                        <p className="text-sm text-amber-800 mt-1">{queueFull.message}</p>
                        <div className="flex items-center gap-4 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                                {queueFull.running} Running
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200">
                                <Clock className="w-3 h-3" />
                                {queueFull.queued} Waiting
                            </span>
                        </div>
                        <p className="text-xs text-amber-600 mt-2">
                            💡 Go to the <strong>Dashboard</strong> to monitor running jobs. You can retry submission once a job completes.
                        </p>
                    </div>
                    <button
                        onClick={() => setQueueFull(null)}
                        className="text-amber-400 hover:text-amber-600 text-xl font-bold leading-none flex-shrink-0"
                        title="Dismiss"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Form Card */}
            <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                            <Info className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Launch Pipeline</h3>
                            <p className="text-slate-500 text-sm">Only two inputs needed — all other paths are auto-configured.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Job Name */}
                        <div>
                            <label htmlFor="job_name" className="block text-sm font-semibold text-slate-700 mb-2">
                                Job Name <span className="text-slate-400 font-normal italic">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                id="job_name"
                                name="job_name"
                                value={formData.job_name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-400"
                                placeholder="e.g. sample-a-run-1"
                            />
                            <p className="mt-1.5 text-xs text-slate-500">Used to organise all output folders. Defaults to <code className="bg-slate-100 px-1 rounded">{jobNamePlaceholder}</code>.</p>
                        </div>

                        {/* RNA BAM */}
                        <div>
                            <label htmlFor="s3_rna_bam" className="block text-sm font-semibold text-slate-700 mb-2">
                                S3 RNA BAM Path <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="s3_rna_bam"
                                    name="s3_rna_bam"
                                    value={formData.s3_rna_bam}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-400"
                                    placeholder="s3://bucket/path/to/rna-bams/"
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
                                <Info className="w-3 h-3 shrink-0" /> S3 prefix containing all the RNA BAM files to process.
                            </p>
                        </div>
                    </div>

                    {/* OR Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t-2 border-teal-200"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-6 py-2 text-sm font-bold text-teal-600 uppercase tracking-wider border-2 border-teal-200 rounded-full shadow-sm">
                                Or
                            </span>
                        </div>
                    </div>

                    {/* File Upload Section */}
                    <div className="mt-6">
                        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-xl p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-900">Upload RNA BAM Files</h4>
                                    <p className="text-xs text-slate-600">Don't have an S3 path? Upload your files here using Tus resumable uploads - supports files of any size</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-5 border border-teal-100 shadow-sm">
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    Select Multiple Files <span className="text-red-500">(Minimum 2 required)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept=".bam"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                        className="block w-full text-sm text-slate-500
                                            file:mr-4 file:py-3 file:px-6
                                            file:rounded-lg file:border-0
                                            file:text-sm file:font-bold
                                            file:bg-gradient-to-r file:from-teal-500 file:to-teal-600
                                            file:text-white file:shadow-md
                                            hover:file:from-teal-600 hover:file:to-teal-700
                                            file:transition-all file:cursor-pointer
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            cursor-pointer border-2 border-dashed border-slate-300 rounded-lg p-4
                                            hover:border-teal-400 transition-colors"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    Only .bam files accepted (minimum 2 files). 
                                </p>
                            </div>

                            {uploading && (
                                <div className="bg-white rounded-lg p-4 border border-teal-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-slate-700">Uploading Files with Tus...</span>
                                        <span className="text-sm font-bold text-teal-600">{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Resumable chunk-wise upload - uploads will continue even if connection is interrupted</p>
                                </div>
                            )}

                            {/* Selected Files Display */}
                            {files && files.length > 0 && (
                                <div className="mt-5">
                                    <div className="bg-white rounded-lg border border-teal-200 shadow-sm overflow-hidden">
                                        <div className="bg-teal-50 px-4 py-3 border-b border-teal-200">
                                            <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <Database className="w-4 h-4 text-teal-600" />
                                                Selected {files.length} file(s):
                                            </h5>
                                        </div>
                                        <div className="p-4">
                                            <div className="space-y-2">
                                                {Array.from(files).map((file, index) => {
                                                    const uploadStatus = uploadStatuses.get(file.name)
                                                    return (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-teal-300 transition-colors group">
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <div className="flex-shrink-0">
                                                                    <div className="h-8 w-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                                                        <Database className="w-4 h-4 text-teal-600" />
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-slate-900 truncate" title={file.name}>
                                                                        {file.name}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                                        {formatFileSize(file.size)}
                                                                    </p>
                                                                    {uploadStatus && (
                                                                        <div className="mt-2">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                                                    <div
                                                                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                                                                            uploadStatus.status === 'completed' ? 'bg-green-500' :
                                                                                            uploadStatus.status === 'error' ? 'bg-red-500' :
                                                                                            uploadStatus.status === 'paused' ? 'bg-yellow-500' :
                                                                                            'bg-teal-500'
                                                                                        }`}
                                                                                        style={{ width: `${uploadStatus.progress}%` }}
                                                                                    ></div>
                                                                                </div>
                                                                                <span className="text-xs font-medium text-slate-600">
                                                                                    {uploadStatus.progress}%
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs text-slate-500">
                                                                                Status: {uploadStatus.status === 'uploading' ? 'Uploading...' :
                                                                                       uploadStatus.status === 'paused' ? 'Paused' :
                                                                                       uploadStatus.status === 'completed' ? 'Completed' :
                                                                                       'Failed'}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {uploadStatus && uploadStatus.status !== 'completed' && (
                                                                    <>
                                                                        {uploadStatus.status === 'paused' ? (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => resumeUpload(file.name)}
                                                                                className="flex-shrink-0 p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors"
                                                                                title="Resume upload"
                                                                            >
                                                                                <Play className="w-4 h-4" />
                                                                            </button>
                                                                        ) : uploadStatus.status === 'uploading' ? (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => pauseUpload(file.name)}
                                                                                className="flex-shrink-0 p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 transition-colors"
                                                                                title="Pause upload"
                                                                            >
                                                                                <Pause className="w-4 h-4" />
                                                                            </button>
                                                                        ) : null}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => cancelUpload(file.name)}
                                                                            className="flex-shrink-0 p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                                                                            title="Cancel upload"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {!uploadStatus && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const dt = new DataTransfer()
                                                                            Array.from(files).forEach((f, i) => {
                                                                                if (i !== index) dt.items.add(f)
                                                                            })
                                                                            const newFiles = dt.files.length > 0 ? dt.files : null
                                                                            setFiles(newFiles)
                                                                            
                                                                            if (fileInputRef.current) {
                                                                                if (newFiles && newFiles.length > 0) {
                                                                                    fileInputRef.current.files = newFiles
                                                                                } else {
                                                                                    fileInputRef.current.value = ''
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="flex-shrink-0 p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                                                                        title="Remove file"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-teal-200">
                                                <p className="text-sm text-slate-600">
                                                    <span className="font-semibold">Total:</span> {formatFileSize(Array.from(files).reduce((acc, f) => acc + f.size, 0))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end mt-5">
                                <button
                                    type="button"
                                    onClick={handleFileUpload}
                                    disabled={uploading || !files || files.length < 2}
                                    className="px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg font-bold text-sm
                                        hover:from-teal-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500
                                        transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Uploading with Tus...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Upload {files && files.length > 0 ? `${files.length} File${files.length > 1 ? 's' : ''}` : 'Files'} with Tus
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-10 py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:from-teal-700 hover:to-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-w-[220px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Starting Pipeline…
                                </>
                            ) : (
                                <>
                                    <ChevronRight className="w-5 h-5" />
                                    Start Unified Pipeline
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
