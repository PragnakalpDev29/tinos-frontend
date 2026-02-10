import { post } from '@/lib/api/axios-client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export interface PreprocessingJobSubmissionDto {
  s3_rna_bam: string
  s3_deg_bam: string
  s3_deg_jr: string
  s3_gtex: string
  s3_gencode: string
  s3_output_bucket: string
  s3_hla_output: string
  s3_rna_bam_output: string
  s3_deg_bam_consolidated: string
  s3_logs_bucket: string
}

export interface PreprocessingJobSubmissionResponse {
  message: string
  jobId: string
  jobName: string
  jobType: string
  fileCount: number
  jobQueue: string
  jobDefinition: string
}

export const jobService = {
  /**
   * Submit a preprocessing job to AWS Batch
   * POST /api/submit-preprocessing/
   */
  submitPreprocessingJob: async (
    data: PreprocessingJobSubmissionDto
  ): Promise<PreprocessingJobSubmissionResponse> => {
    return post<PreprocessingJobSubmissionResponse>(
      API_ENDPOINTS.JOBS.SUBMIT_PREPROCESSING,
      data
    )
  },
}
