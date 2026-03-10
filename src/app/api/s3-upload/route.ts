import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getServerSession } from 'next-auth'

const AWS_REGION = process.env.AWS_REGION || ''
const ACCESS_KEY = process.env.ACCESS_KEY || ''
const SECRET_KEY = process.env.SECRET_KEY || ''
const BUCKET_NAME = process.env.BUCKET_NAME || 'epicode-neoantigen'

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
})

function createTimestampFolder(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      message: 'S3 upload endpoint available',
      recommended: 'Use Tus resumable uploads at /api/tus-upload for large files',
      maxSize: 'Unlimited',
      supportedFormats: ['.bam'],
      tusEndpoint: '/api/tus-upload',
      chunkSize: '4MB',
    })
  } catch (error) {
    console.error('S3 upload info error:', error)
    return NextResponse.json(
      { error: 'Failed to get upload info' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!AWS_REGION || !ACCESS_KEY || !SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: 'AWS credentials not configured. Please set AWS_REGION, ACCESS_KEY, and SECRET_KEY environment variables.'
        },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const s3BucketUrl = formData.get('s3_bucket_url') as string

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      )
    }

    if (!s3BucketUrl) {
      return NextResponse.json(
        { success: false, message: 'No S3 bucket URL provided' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    const timestampFolder = createTimestampFolder()

    let basePath = ''
    if (s3BucketUrl.startsWith('s3://')) {
      const urlParts = s3BucketUrl.replace('s3://', '').split('/')
      urlParts.shift()
      basePath = urlParts.join('/')
    } else {
      basePath = s3BucketUrl.replace(/^\/+/, '')
    }

    const uploadedFiles: Array<{ filename: string; s3_url: string; size: number }> = []
    const failedFiles: Array<{ filename: string; error: string }> = []
    let totalSize = 0

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const s3Key = `${basePath}/${timestampFolder}/${file.name}`

        const uploadParams = {
          Bucket: BUCKET_NAME,
          Key: s3Key,
          Body: buffer,
          ContentType: file.type || 'application/octet-stream',
          ServerSideEncryption: 'AES256' as const,
        }

        const command = new PutObjectCommand(uploadParams)
        await s3Client.send(command)

        const s3Url = `s3://${BUCKET_NAME}/${s3Key}`
        uploadedFiles.push({
          filename: file.name,
          s3_url: s3Url,
          size: file.size,
        })
        totalSize += file.size
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        failedFiles.push({
          filename: file.name,
          error: errorMessage,
        })
      }
    }

    const endTime = Date.now()
    const uploadTime = (endTime - startTime) / 1000

    const folderPath = `${basePath}/${timestampFolder}`

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'All files failed to upload',
          failed_files: failedFiles,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} of ${files.length} file(s)`,
      folder_name: folderPath,
      uploaded_files: uploadedFiles,
      total_size: totalSize,
      upload_time: uploadTime,
      failed_files: failedFiles.length > 0 ? failedFiles : undefined,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        success: false,
        message: `Upload failed: ${errorMessage}`
      },
      { status: 500 }
    )
  }
}
