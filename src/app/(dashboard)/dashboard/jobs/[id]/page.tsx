'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { JobDetailsContent } from '@/components/features/dashboard/job-details-content'

// SECURITY: Allowlist of valid job types to prevent injection via URL parameters
const ALLOWED_JOB_TYPES = ['preprocessing', 'neoantigen', 'arcas-hla', 'm6a'] as const
type JobType = typeof ALLOWED_JOB_TYPES[number]

function validateJobType(raw: string | null): JobType {
  if (raw && ALLOWED_JOB_TYPES.includes(raw as JobType)) {
    return raw as JobType
  }
  return 'preprocessing' // safe default
}

export default function JobDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const jobType = validateJobType(searchParams.get('type'))

  return <JobDetailsContent jobId={params.id as string} jobType={jobType} />
}
