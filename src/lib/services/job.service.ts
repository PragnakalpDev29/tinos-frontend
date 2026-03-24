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

export interface ArcasHlaJobData {
  id?: number
  batch_job_id: string
  job_name: string
  s3_input_prefix: string
  s3_output_prefix: string
  s3_effective_output_prefix: string
  threads: number
  file_count: number
  job_queue: string
  job_definition: string
  status: string
  failure_reason: string | null
  created_at?: string
  updated_at?: string
}

export interface ArcasHlaSubmissionDto {
  s3_input_prefix: string
  s3_output_prefix: string
  threads: number
  job_name?: string
}

export interface ArcasHlaSubmissionResponse {
  message: string
  jobId: string
  threads: number
  fileCount: number
  s3_input_prefix: string
  s3_output_prefix: string
  s3_effective_output_prefix: string
  arcasHla: ArcasHlaJobData
}

export interface PipelineStatusResponse {
  pipeline_id: number
  stage1: {
    id: number
    batch_id: string
    status: string
    type: string
  }
  stage1_hla: {
    id: number
    batch_id: string
    status: string
    type: string
    s3_input_prefix: string
    s3_output_prefix: string
    s3_effective_output_prefix: string
    threads: number
    file_count: number
    failure_reason: string | null
  } | null
  stage2: {
    id: number
    batch_id: string
    status: string
    type: string
  } | null
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
    return get<any[]>(API_ENDPOINTS.JOBS.SUBMIT_PREPROCESSING)
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
   * Get the linked neoantigen job for a preprocessing job (server-side matching)
   * GET /api/submit-preprocessing/{id}/neoantigen/
   */
  getLinkedNeoantigenJob: async (preprocessingJobId: number | string): Promise<any | null> => {
    const { get } = await import('@/lib/api/axios-client')
    try {
      const result = await get<any>(`${API_ENDPOINTS.JOBS.SUBMIT_PREPROCESSING}${preprocessingJobId}/neoantigen/`)
      return result || null
    } catch {
      return null
    }
  },

  /**
   * Submit a neoantigen job to AWS Batch
   * POST /api/submit-neoantigen/
   */
  submitNeoantigenJob: async (data: any): Promise<any> => {
    return post<any>(API_ENDPOINTS.JOBS.SUBMIT_NEOANTIGEN, data)
  },

  /**
   * Sync all non-terminal jobs for the current user with AWS Batch
   * POST /api/sync-active-jobs/
   */
  syncActiveJobs: async (): Promise<{ message: string; synced_count: number }> => {
    return post<{ message: string; synced_count: number }>(
      API_ENDPOINTS.JOBS.SYNC_ACTIVE_JOBS,
      {}
    )
  },

  /**
   * Get comprehensive pipeline status including HLA job
   * GET /api/pipeline-status/{job_id}/
   */
  getPipelineStatus: async (jobId: string): Promise<PipelineStatusResponse> => {
    const { get } = await import('@/lib/api/axios-client')
    return get<PipelineStatusResponse>(API_ENDPOINTS.JOBS.PIPELINE_STATUS(jobId))
  },

  /**
   * Submit a standalone arcasHLA job
   * POST /api/submit-arcas-hla/
   */
  submitArcasHlaJob: async (data: ArcasHlaSubmissionDto): Promise<ArcasHlaSubmissionResponse> => {
    return post<ArcasHlaSubmissionResponse>(API_ENDPOINTS.JOBS.SUBMIT_ARCAS_HLA, data)
  },
}
