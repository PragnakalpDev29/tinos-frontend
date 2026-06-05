/**
 * Single source of truth for tus client ↔ Next.js `/api/tus-upload` ↔ S3 multipart.
 * Larger parts = fewer round trips (often faster on good networks). S3 requires
 * each part except the last to be ≥ 5 MiB; 16 MiB is a common balance.
 */
export const TUS_CHUNK_SIZE_BYTES = 16 * 1024 * 1024
