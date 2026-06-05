import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3'
import { s3Client, getUploadMetadata, saveUploadMetadata, deleteUploadMetadata, CHUNK_SIZE } from '../shared'

const BUCKET_NAME = process.env.BUCKET_NAME || 'epicode-neoantigen'

function getSessionIdentity(session: any): { userId?: string; email?: string } {
    const userId = session?.user?.id ? String(session.user.id) : undefined
    const email = session?.user?.email
        ? String(session.user.email).toLowerCase()
        : undefined
    return { userId, email }
}

function isOwner(upload: any, identity: { userId?: string; email?: string }): boolean {
    const uploadUserId = upload?.ownerUserId ? String(upload.ownerUserId) : undefined
    const uploadEmail = upload?.ownerEmail ? String(upload.ownerEmail).toLowerCase() : undefined
    if (uploadUserId && identity.userId) return uploadUserId === identity.userId
    if (uploadEmail && identity.email) return uploadEmail === identity.email
    return false
}

export async function OPTIONS(request: NextRequest) {
    // SECURITY: Restrict CORS to specific origins instead of wildcard '*'
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://your-domain.com'
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Methods': 'PATCH, HEAD, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Upload-Length, Upload-Offset, Tus-Resumable, Upload-Metadata',
            'Access-Control-Allow-Credentials': 'true',
            'Tus-Resumable': '1.0.0',
        },
    })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession()

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id: uploadId } = await params
        const upload = await getUploadMetadata(uploadId)

        if (!upload) {
            return NextResponse.json(
                { error: 'Upload not found' },
                { status: 404 }
            )
        }

        const identity = getSessionIdentity(session)
        // Backward compatibility for legacy metadata created before ownership
        // binding: claim ownership on first authenticated access.
        if (!upload.ownerUserId && !upload.ownerEmail) {
            upload.ownerUserId = identity.userId
            upload.ownerEmail = identity.email
            await saveUploadMetadata(uploadId, upload)
        } else if (!isOwner(upload, identity)) {
            return NextResponse.json(
                { error: 'Forbidden: upload belongs to another user' },
                { status: 403 }
            )
        }

        const uploadOffset = request.headers.get('upload-offset')

        if (!uploadOffset) {
            return NextResponse.json(
                { error: 'Upload-Offset header is required' },
                { status: 400 }
            )
        }

        const offset = parseInt(uploadOffset)
        const chunk = await request.arrayBuffer()

        // Sequential S3 part index (1-based). Using part count keeps part numbers
        // correct even if client `chunkSize` is changed, as long as Tus sends
        // ordered chunks.
        const partNumber = upload.parts.length + 1

        const uploadCommand = new UploadPartCommand({
            Bucket: BUCKET_NAME,
            Key: upload.key,
            PartNumber: partNumber,
            UploadId: upload.uploadId,
            Body: new Uint8Array(chunk),
        })

        const uploadResponse = await s3Client.send(uploadCommand)

        upload.parts.push({
            partNumber,
            etag: uploadResponse.ETag!,
        })

        upload.parts.sort((a: { partNumber: number }, b: { partNumber: number }) => a.partNumber - b.partNumber)

        const newOffset = offset + chunk.byteLength
        upload.uploadedByteOffset = newOffset

        await saveUploadMetadata(uploadId, upload)

        const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://your-domain.com'
        const headers: Record<string, string> = {
            'Upload-Offset': newOffset.toString(),
            'Tus-Resumable': '1.0.0',
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Expose-Headers': 'Upload-Offset, Tus-Resumable',
        }

        if (newOffset >= upload.size) {
            const completeCommand = new CompleteMultipartUploadCommand({
                Bucket: BUCKET_NAME,
                Key: upload.key,
                UploadId: upload.uploadId,
                MultipartUpload: {
                    Parts: upload.parts.map((part: { partNumber: number; etag: string }) => ({
                        PartNumber: part.partNumber,
                        ETag: part.etag,
                    })),
                },
            })

            await s3Client.send(completeCommand)

            upload.completed = true
            upload.completedAt = Date.now()

            await saveUploadMetadata(uploadId, upload)

            const s3Url = `s3://${BUCKET_NAME}/${upload.key}`
            const folderPath = upload.key.substring(0, upload.key.lastIndexOf('/'))
            const fileName = upload.key.split('/').pop() || 'unknown'

            headers['Upload-Complete'] = 'true'
            headers['S3-Url'] = s3Url
            headers['Folder-Path'] = folderPath
            headers['File-Name'] = fileName
            headers['Access-Control-Expose-Headers'] = 'Upload-Offset, Tus-Resumable, Upload-Complete, S3-Url, Folder-Path, File-Name'
        }

        return new NextResponse(null, {
            status: 204,
            headers,
        })
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Tus PATCH error:', error)
        } else {
            console.error('Tus PATCH error')
        }
        return NextResponse.json(
            { error: 'Failed to upload chunk' },
            { status: 500 }
        )
    }
}

export async function HEAD(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession()

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id: uploadId } = await params
        const upload = await getUploadMetadata(uploadId)

        if (!upload) {
            return NextResponse.json(
                { error: 'Upload not found' },
                { status: 404 }
            )
        }

        const identity = getSessionIdentity(session)
        if (!upload.ownerUserId && !upload.ownerEmail) {
            upload.ownerUserId = identity.userId
            upload.ownerEmail = identity.email
            await saveUploadMetadata(uploadId, upload)
        } else if (!isOwner(upload, identity)) {
            return NextResponse.json(
                { error: 'Forbidden: upload belongs to another user' },
                { status: 403 }
            )
        }

        let currentOffset = 0
        if (typeof upload.uploadedByteOffset === 'number') {
            currentOffset = upload.uploadedByteOffset
        } else if (upload.parts?.length) {
            // Legacy metadata (no stored offset): rough estimate for resume only
            currentOffset = Math.min(upload.parts.length * CHUNK_SIZE, upload.size)
        }

        const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://your-domain.com'
        const headers: Record<string, string> = {
            'Upload-Offset': Math.min(currentOffset, upload.size).toString(),
            'Upload-Length': upload.size.toString(),
            'Tus-Resumable': '1.0.0',
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Expose-Headers': 'Upload-Offset, Upload-Length, Tus-Resumable',
        }

        if (upload.completed) {
            const s3Url = `s3://${BUCKET_NAME}/${upload.key}`
            const folderPath = upload.key.substring(0, upload.key.lastIndexOf('/'))

            headers['Upload-Complete'] = 'true'
            headers['S3-Url'] = s3Url
            headers['Folder-Path'] = folderPath
            headers['Access-Control-Expose-Headers'] = 'Upload-Offset, Upload-Length, Tus-Resumable, Upload-Complete, S3-Url, Folder-Path'
        }

        return new NextResponse(null, {
            status: 200,
            headers,
        })
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Tus HEAD error:', error)
        } else {
            console.error('Tus HEAD error')
        }
        return NextResponse.json(
            { error: 'Failed to get upload info' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession()

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id: uploadId } = await params
        const upload = await getUploadMetadata(uploadId)

        if (!upload) {
            return NextResponse.json(
                { error: 'Upload not found' },
                { status: 404 }
            )
        }

        const identity = getSessionIdentity(session)
        if (!upload.ownerUserId && !upload.ownerEmail) {
            upload.ownerUserId = identity.userId
            upload.ownerEmail = identity.email
            await saveUploadMetadata(uploadId, upload)
        } else if (!isOwner(upload, identity)) {
            return NextResponse.json(
                { error: 'Forbidden: upload belongs to another user' },
                { status: 403 }
            )
        }

        try {
            const abortCommand = new AbortMultipartUploadCommand({
                Bucket: BUCKET_NAME,
                Key: upload.key,
                UploadId: upload.uploadId,
            })
            await s3Client.send(abortCommand)
            await deleteUploadMetadata(uploadId)
        } catch (error) { }

        return new NextResponse(null, {
            status: 204,
            headers: {
                'Tus-Resumable': '1.0.0',
                'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://your-domain.com',
            },
        })
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Tus DELETE error:', error)
        } else {
            console.error('Tus DELETE error')
        }
        return NextResponse.json(
            { error: 'Failed to delete upload' },
            { status: 500 }
        )
    }
}
