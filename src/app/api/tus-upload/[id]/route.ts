import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3'
import { s3Client, getUploadMetadata, saveUploadMetadata, deleteUploadMetadata, CHUNK_SIZE } from '../shared'

const BUCKET_NAME = process.env.BUCKET_NAME || 'epicode-neoantigen'

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PATCH, HEAD, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Upload-Length, Upload-Offset, Tus-Resumable, Upload-Metadata',
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

        const uploadOffset = request.headers.get('upload-offset')

        if (!uploadOffset) {
            return NextResponse.json(
                { error: 'Upload-Offset header is required' },
                { status: 400 }
            )
        }

        const offset = parseInt(uploadOffset)
        const chunk = await request.arrayBuffer()

        const partNumber = Math.floor(offset / CHUNK_SIZE) + 1

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

        await saveUploadMetadata(uploadId, upload)

        const newOffset = offset + chunk.byteLength

        const headers: Record<string, string> = {
            'Upload-Offset': newOffset.toString(),
            'Tus-Resumable': '1.0.0',
            'Access-Control-Allow-Origin': '*',
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
        console.error('Tus PATCH error:', error)
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

        const currentOffset = upload.parts.reduce((sum: number, part: { partNumber: number }) => {
            return sum + (part.partNumber * CHUNK_SIZE)
        }, 0)

        const headers: Record<string, string> = {
            'Upload-Offset': Math.min(currentOffset, upload.size).toString(),
            'Upload-Length': upload.size.toString(),
            'Tus-Resumable': '1.0.0',
            'Access-Control-Allow-Origin': '*',
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
        console.error('Tus HEAD error:', error)
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
                'Access-Control-Allow-Origin': '*',
            },
        })
    } catch (error) {
        console.error('Tus DELETE error:', error)
        return NextResponse.json(
            { error: 'Failed to delete upload' },
            { status: 500 }
        )
    }
}
