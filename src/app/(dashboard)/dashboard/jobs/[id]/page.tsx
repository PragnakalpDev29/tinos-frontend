'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { JobDetailsContent } from '@/components/features/dashboard/job-details-content'

export default function JobDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const jobType = searchParams.get('type') || 'preprocessing'

  return <JobDetailsContent jobId={params.id as string} jobType={jobType} />
}
