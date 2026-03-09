# S3 File Upload Feature

## Overview
This feature allows authenticated users to upload files directly to AWS S3 buckets through the TINOS frontend application. The implementation mirrors the Python backend functionality with a user-friendly interface.

## Features
- ✅ File upload with progress tracking
- ✅ Custom S3 bucket path configuration
- ✅ AES256 server-side encryption
- ✅ Multipart upload support for large files
- ✅ Real-time upload progress display
- ✅ Detailed upload response with S3 URL and metadata

## Setup Instructions

### 1. Environment Variables
Add the following variables to your `.env` file:

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
ACCESS_KEY=your-aws-access-key-id
SECRET_KEY=your-aws-secret-access-key
BUCKET_NAME=epicode-neoantigen
```

### 2. AWS Credentials
Ensure your AWS credentials have the following permissions:
- `s3:PutObject` - To upload files
- `s3:PutObjectAcl` - To set object permissions (if needed)

### 3. Dependencies
The AWS SDK is already installed via:
```bash
npm install @aws-sdk/client-s3
```

## Usage

### Accessing the Feature
1. Navigate to the dashboard
2. Click on **S3 Upload** in the sidebar menu
3. You'll be redirected to `/s3-upload`

### Uploading a File
1. **Select File**: Click the file input to choose a file from your system
2. **Enter S3 Bucket URL**: Provide the S3 path where the file should be uploaded
   - Format: `s3://bucket-name/path/to/folder`
   - Or: `path/to/folder` (bucket name from env)
3. **Upload**: Click the "Upload to S3" button
4. **Monitor Progress**: Watch the progress bar for upload status
5. **View Response**: See upload details including S3 URL, file size, and upload time

### S3 Bucket URL Examples
```
s3://epicode-neoantigen/pragnakalp_neoantigen_output/mansi
pragnakalp_neoantigen_output/mansi
uploads/documents
```

## Implementation Details

### Frontend Component
**Location**: `src/app/(dashboard)/s3-upload/page.tsx`

Key features:
- File selection with size display
- S3 bucket URL input
- XMLHttpRequest for upload progress tracking
- Real-time progress bar
- Success/error response display

### API Route
**Location**: `src/app/api/s3-upload/route.ts`

Handles:
- Authentication check via NextAuth
- File processing and buffer conversion
- S3 path parsing
- AWS S3 upload with encryption
- Upload time tracking
- Error handling

### Upload Process
1. User selects file and enters S3 path
2. Frontend sends FormData via XMLHttpRequest
3. API route authenticates the request
4. File is converted to buffer
5. S3 path is parsed and validated
6. File is uploaded to S3 with AES256 encryption
7. Response includes S3 URL and metadata
8. Frontend displays results

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "s3_url": "s3://bucket-name/path/to/file.pdf",
  "file_size": 1048576,
  "upload_time": 2.45
}
```

### Error Response
```json
{
  "success": false,
  "message": "Upload failed: [error details]"
}
```

## Security Features
- ✅ Authentication required (NextAuth session)
- ✅ Server-side encryption (AES256)
- ✅ Environment variable protection for credentials
- ✅ File type validation
- ✅ Error message sanitization

## Comparison with Python Implementation

### Python Code Features
```python
# Multipart upload configuration
config = TransferConfig(
    multipart_threshold=500 * 1024 * 1024,
    multipart_chunksize=50 * 1024 * 1024,
    use_threads=True
)

# Progress callback
def progress_callback(bytes_transferred, total_size):
    percentage = (bytes_transferred / total_size) * 100
    # Display progress
```

### Frontend Implementation
- ✅ Progress tracking via XMLHttpRequest upload events
- ✅ Server-side encryption (AES256)
- ✅ Automatic multipart upload (handled by AWS SDK)
- ✅ File size and upload time tracking
- ✅ User-friendly progress display

## Troubleshooting

### Common Issues

**1. "AWS credentials not configured" error**
- Ensure `.env` file has AWS_REGION, ACCESS_KEY, and SECRET_KEY
- Restart the development server after adding variables

**2. "Unauthorized" error**
- User must be logged in
- Check NextAuth session configuration

**3. Upload fails with permission error**
- Verify AWS credentials have `s3:PutObject` permission
- Check bucket name and path are correct

**4. TypeScript errors for @aws-sdk/client-s3**
- Restart TypeScript server in your IDE
- Run `npm install` to ensure dependencies are installed

## Future Enhancements
- [ ] Multiple file upload support
- [ ] Drag-and-drop file interface
- [ ] File type restrictions
- [ ] Upload history/logs
- [ ] Pre-signed URL generation for downloads
- [ ] Folder browsing for S3 paths

## Related Files
- Sidebar: `src/components/layouts/dashboard-sidebar.tsx`
- Page: `src/app/(dashboard)/s3-upload/page.tsx`
- API: `src/app/api/s3-upload/route.ts`
- Env: `.env.example`
