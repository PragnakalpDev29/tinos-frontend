import { post } from '@/lib/api/axios-client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export interface PreprocessingJobSubmissionDto {
  s3_rna_bam: string
  s3_deg_bam?: string
  s3_deg_jr?: string
  s3_gtex?: string
  s3_gencode?: string
  s3_output_bucket?: string
  s3_hla_output?: string
  s3_rna_bam_output?: string
  s3_deg_bam_consolidated?: string
  s3_logs_bucket?: string
  job_name?: string
  neoantigen_output_path?: string
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

  /**
   * Get list of all preprocessing jobs from the database
   * GET /api/submit-preprocessing/
   */
  getPreprocessingJobs: async (): Promise<any[]> => {
    const { get } = await import('@/lib/api/axios-client')
    return get<any[]>(`${API_ENDPOINTS.JOBS.SUBMIT_PREPROCESSING}?expand_children=true`)
  },

  /**
   * Get a single preprocessing job by ID
   * GET /api/submit-preprocessing/{id}/
   */
  getPreprocessingJobById: async (id: number | string): Promise<any> => {
    const { get } = await import('@/lib/api/axios-client')
    return get<any>(`${API_ENDPOINTS.JOBS.SUBMIT_PREPROCESSING}${id}/`)
  },

  /**
   * Get list of all neoantigen jobs from the database
   * GET /api/submit-neoantigen/
   */
  getNeoantigenJobs: async (): Promise<any[]> => {
    const { get } = await import('@/lib/api/axios-client')
    return get<any[]>(API_ENDPOINTS.JOBS.SUBMIT_NEOANTIGEN)
  },

  /**
   * Get a single neoantigen job by ID
   * GET /api/submit-neoantigen/{id}/
   */
  getNeoantigenJobById: async (id: number | string): Promise<any> => {
    const { get } = await import('@/lib/api/axios-client')
    return get<any>(`${API_ENDPOINTS.JOBS.SUBMIT_NEOANTIGEN}${id}/`)
  },

  /**
   * Submit a neoantigen job to AWS Batch
   * POST /api/submit-neoantigen/
   */
  submitNeoantigenJob: async (data: any): Promise<any> => {
    return post<any>(API_ENDPOINTS.JOBS.SUBMIT_NEOANTIGEN, data)
  },
}
