import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'
import { s3Client, saveUploadMetadata, createTimestampFolder, cleanOldUploads } from './shared'

const AWS_REGION = process.env.AWS_REGION || ''
const ACCESS_KEY = process.env.ACCESS_KEY || ''
const SECRET_KEY = process.env.SECRET_KEY || ''
const BUCKET_NAME = process.env.BUCKET_NAME || 'epicode-neoantigen'

export async function OPTIONS(request: NextRequest) {
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://your-domain.com'
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Upload-Length, Upload-Offset, Tus-Resumable, Upload-Metadata, X-S3-Bucket-Url, X-Timestamp-Folder',
            'Access-Control-Allow-Credentials': 'true',
            'Tus-Resumable': '1.0.0',
        },
    })
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
            message: 'Tus upload endpoint ready',
            version: '1.0.0',
            supportedVersions: ['1.0.0'],
            extensions: ['creation', 'creation-with-upload', 'expiration', 'termination'],
            maxSize: 'Unlimited',
            chunkSize: '4MB',
        })
    } catch (error) {
        console.error('Tus info error:', error)
        return NextResponse.json(
            { error: 'Failed to get Tus info' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        if (!AWS_REGION || !ACCESS_KEY || !SECRET_KEY) {
            return NextResponse.json(
                {
                    error: 'AWS credentials not configured'
                },
                { status: 500 }
            )
        }

        cleanOldUploads()

        const uploadLength = request.headers.get('upload-length')
        const uploadMetadata = request.headers.get('upload-metadata')
        const s3BucketUrl = request.headers.get('x-s3-bucket-url') || 'pragnakalp_rna_bam_uploads'
        const clientTimestampFolder = request.headers.get('x-timestamp-folder')

        if (!uploadLength) {
            return NextResponse.json(
                { error: 'Upload-Length header is required' },
                { status: 400 }
            )
        }

        const size = parseInt(uploadLength)
        if (isNaN(size) || size <= 0) {
            return NextResponse.json(
                { error: 'Invalid Upload-Length' },
                { status: 400 }
            )
        }

        let filename = 'unknown'
        if (uploadMetadata) {
            const metadataPairs = uploadMetadata.split(',')
            for (const pair of metadataPairs) {
                const trimmedPair = pair.trim()
                const spaceIndex = trimmedPair.indexOf(' ')

                if (spaceIndex === -1) continue

                const key = trimmedPair.substring(0, spaceIndex)
                const value = trimmedPair.substring(spaceIndex + 1)

                if (key === 'filename') {
                    try {
                        let decoded = Buffer.from(value, 'base64').toString('utf-8')
                        // SECURITY: Sanitize filename to prevent path traversal attacks
                        // Strip null bytes, path components, and limit length
                        decoded = decoded.replace(/\0/g, '').replace(/\.\./g, '').replace(/[\/\\]/g, '_')
                        if (decoded.length > 255) decoded = decoded.substring(0, 255)
                        if (decoded.length > 0) {
                            filename = decoded
                        }
                    } catch (error) { }
                    break
                }
            }
        }

        if (!filename.toLowerCase().endsWith('.bam')) {
            filename = `${filename}.bam`
        }

        const timestampFolder = clientTimestampFolder || createTimestampFolder()
        let basePath = ''
        if (s3BucketUrl.startsWith('s3://')) {
            const urlParts = s3BucketUrl.replace('s3://', '').split('/')
            urlParts.shift()
            basePath = urlParts.join('/')
        } else {
            basePath = s3BucketUrl.replace(/^\/+/, '')
        }

        const key = `${basePath}/${timestampFolder}/${filename}`

        if (!key.toLowerCase().endsWith('.bam')) {
            return NextResponse.json(
                { error: 'Invalid file: S3 key must end with .bam extension' },
                { status: 400 }
            )
        }

        const createCommand = new CreateMultipartUploadCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: 'application/octet-stream',
            ServerSideEncryption: 'AES256',
        })

        const createResponse = await s3Client.send(createCommand)
        const uploadId = createResponse.UploadId!

        const uploadIdShort = crypto.randomBytes(16).toString('hex')

        await saveUploadMetadata(uploadIdShort, {
            uploadId,
            key,
            size,
            parts: [],
            createdAt: Date.now(),
        })

        const location = `${request.nextUrl.origin}/api/tus-upload/${uploadIdShort}`

        return new NextResponse(null, {
            status: 201,
            headers: {
                'Location': location,
                'Upload-Offset': '0',
                'Tus-Resumable': '1.0.0',
                'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://your-domain.com',
                'Access-Control-Expose-Headers': 'Location, Upload-Offset, Tus-Resumable',
            },
        })
    } catch (error) {
        console.error('Tus POST error:', error)
        return NextResponse.json(
            { error: 'Failed to create upload' },
            { status: 500 }
        )
    }
}
