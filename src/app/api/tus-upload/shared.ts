import { S3Client, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const AWS_REGION = process.env.AWS_REGION || ''
const ACCESS_KEY = process.env.ACCESS_KEY || ''
const SECRET_KEY = process.env.SECRET_KEY || ''
const BUCKET_NAME = process.env.BUCKET_NAME || 'epicode-neoantigen'

export const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
    },
})

// Use globalThis to persist across API calls in development/production
declare global {
    var tusUploadStore: Map<string, {
        uploadId: string
        key: string
        size: number
        parts: Array<{ partNumber: number; etag: string }>
        createdAt: number
        completed?: boolean
        completedAt?: number
    }> | undefined
}

export const uploadStore = globalThis.tusUploadStore || new Map<string, {
    uploadId: string
    key: string
    size: number
    parts: Array<{ partNumber: number; etag: string }>
    createdAt: number
    completed?: boolean
    completedAt?: number
}>()

// Store in global to persist across hot reloads in development
if (process.env.NODE_ENV === 'development') {
    globalThis.tusUploadStore = uploadStore
}

// S3-based persistence for production
const METADATA_PREFIX = 'tus-metadata/'

export async function saveUploadMetadata(id: string, metadata: {
    uploadId: string
    key: string
    size: number
    parts: Array<{ partNumber: number; etag: string }>
    createdAt: number
    completed?: boolean
    completedAt?: number
}) {
    try {
        // Save to in-memory store
        uploadStore.set(id, metadata)

        // Also save to S3 for persistence in serverless environments
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `${METADATA_PREFIX}${id}.json`,
            Body: JSON.stringify(metadata),
            ContentType: 'application/json',
            ServerSideEncryption: 'AES256',
        })

        await s3Client.send(command)
    } catch (error) {
        console.error('Failed to save upload metadata:', error)
        // Don't throw - in-memory store still works
    }
}

export async function getUploadMetadata(id: string) {
    // First check in-memory store
    let metadata = uploadStore.get(id)

    if (!metadata) {
        // Try to load from S3
        try {
            const command = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: `${METADATA_PREFIX}${id}.json`,
            })

            const response = await s3Client.send(command)
            const body = await response.Body?.transformToString()

            if (body) {
                metadata = JSON.parse(body)
                // Restore to in-memory store
                if (metadata) {
                    uploadStore.set(id, metadata)
                }
            }
        } catch (error) {
            // Metadata not found in S3
            console.error('Failed to load upload metadata from S3:', error)
        }
    }

    return metadata
}

export async function deleteUploadMetadata(id: string) {
    // Remove from in-memory store
    uploadStore.delete(id)

    // Remove from S3
    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `${METADATA_PREFIX}${id}.json`,
        })

        await s3Client.send(command)
    } catch (error) {
        console.error('Failed to delete upload metadata:', error)
    }
}

export function createTimestampFolder(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
}

export function cleanOldUploads() {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours for regular uploads
    const completedMaxAge = 60 * 60 * 1000 // 1 hour for completed uploads

    for (const [id, upload] of uploadStore.entries()) {
        const age = now - upload.createdAt
        if (upload.completed && upload.completedAt) {
            // Remove completed uploads after 1 hour
            if (now - upload.completedAt > completedMaxAge) {
                uploadStore.delete(id)
            }
        } else {
            // Remove incomplete uploads after 24 hours
            if (age > maxAge) {
                uploadStore.delete(id)
            }
        }
    }
}

export const CHUNK_SIZE = 4 * 1024 * 1024 // 4MB chunks
