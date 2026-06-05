import { API_ENDPOINTS } from '@/lib/api/endpoints'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'

// Create a dedicated axios instance with Bearer token authentication
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API || '/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor to attach Bearer token from session
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    // Dynamically import NextAuth to get session
    const { getSession } = await import('next-auth/react')
    const session = await getSession()
    const token = (session as any)?.access || session?.user?.access
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

// ────────────────────────────────────────────────────────────────────────
// Response interceptor: transparently refresh an expired JWT and retry.
//
// Without this, SimpleJWT returns 401 "Given token not valid for any token
// type" once the access token TTL expires, which surfaces to the user as a
// confusing toast on Submit. We try a single refresh using the NextAuth
// session's refresh token; on success we update the session and retry the
// failed request. If refresh fails, we reject normally.
// ────────────────────────────────────────────────────────────────────────
type RetryableConfig = AxiosRequestConfig & { _retry?: boolean }
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const flushQueue = (token: string | null, err: unknown = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(err)
  })
  pendingQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined
    const status = error.response?.status

    if (typeof window === 'undefined' || status !== 401 || !original || original._retry) {
      return Promise.reject(error)
    }

    original._retry = true

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then((token) => {
        if (!original.headers) original.headers = {} as any
        ;(original.headers as any)['Authorization'] = `Bearer ${token}`
        return api(original)
      })
    }

    isRefreshing = true
    try {
      // The NextAuth session callback deliberately hides the refresh token from
      // the browser. Delegate to a server-side route that has access to the
      // encrypted NextAuth JWT (which still contains the refresh token) and
      // returns a fresh access token.
      const refreshRes = await axios.post(
        '/api/auth/refresh-access',
        {},
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 },
      )
      const newAccess: string | undefined = refreshRes.data?.access
      if (!newAccess) throw new Error('Refresh endpoint returned no access token')

      // Patch the in-memory NextAuth session so subsequent calls in this page
      // load pick up the new token immediately. The encrypted server-side JWT
      // still holds the original refresh token — that stays put.
      try {
        const { getSession } = await import('next-auth/react')
        const current = await getSession()
        if (current) {
          ;(current as any).access = newAccess
          if ((current as any).user) (current as any).user.access = newAccess
        }
      } catch {
        /* non-fatal */
      }

      flushQueue(newAccess)
      if (!original.headers) original.headers = {} as any
      ;(original.headers as any)['Authorization'] = `Bearer ${newAccess}`
      return api(original)
    } catch (refreshErr) {
      flushQueue(null, refreshErr)
      try {
        // Kill any in-flight uploads + clear the sidebar pill before we
        // tear down the session; otherwise the pill can sit at the last
        // known % on the /login page.
        const { useUploadStore, useM6aUploadStore } = await import('@/store')
        try { useUploadStore.getState().reset() } catch { /* ignore */ }
        try { useM6aUploadStore.getState().reset() } catch { /* ignore */ }
      } catch {
        /* ignore */
      }
      try {
        const { signOut } = await import('next-auth/react')
        // Gentle redirect to login when refresh is clearly dead.
        signOut({ callbackUrl: '/login' })
      } catch {
        /* ignore */
      }
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  },
)

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
    const response = await api.post<PreprocessingJobSubmissionResponse>(
      API_ENDPOINTS.JOBS.SUBMIT_PREPROCESSING,
      data
    )
    return response.data
  },

  /**
   * Get list of all preprocessing jobs from the database
   * GET /api/submit-preprocessing/
   */
  getPreprocessingJobs: async (): Promise<any[]> => {
    const response = await api.get<any[]>(API_ENDPOINTS.JOBS.SUBMIT_PREPROCESSING)
    return response.data
  },

  /**
   * Get a single preprocessing job by ID
   * GET /api/submit-preprocessing/{id}/
   */
  getPreprocessingJobById: async (id: number | string): Promise<any> => {
    const response = await api.get<any>(`${API_ENDPOINTS.JOBS.SUBMIT_PREPROCESSING}${id}/`)
    return response.data
  },

  /**
   * Get list of all neoantigen jobs from the database
   * GET /api/submit-neoantigen/
   */
  getNeoantigenJobs: async (): Promise<any[]> => {
    const response = await api.get<any[]>(API_ENDPOINTS.JOBS.SUBMIT_NEOANTIGEN)
    return response.data
  },

  /**
   * Get a single neoantigen job by ID
   * GET /api/submit-neoantigen/{id}/
   */
  getNeoantigenJobById: async (id: number | string): Promise<any> => {
    const response = await api.get<any>(`${API_ENDPOINTS.JOBS.SUBMIT_NEOANTIGEN}${id}/`)
    return response.data
  },

  /**
   * Get the linked neoantigen job for a preprocessing job (server-side matching)
   * GET /api/submit-preprocessing/{id}/neoantigen/
   */
  getLinkedNeoantigenJob: async (preprocessingJobId: number | string): Promise<any | null> => {
    try {
      const response = await api.get<any>(`${API_ENDPOINTS.JOBS.SUBMIT_PREPROCESSING}${preprocessingJobId}/neoantigen/`)
      return response.data || null
    } catch {
      return null
    }
  },

  /**
   * Submit a neoantigen job to AWS Batch
   * POST /api/submit-neoantigen/
   */
  submitNeoantigenJob: async (data: any): Promise<any> => {
    const response = await api.post<any>(API_ENDPOINTS.JOBS.SUBMIT_NEOANTIGEN, data)
    return response.data
  },

  /**
   * Sync all non-terminal jobs for the current user with AWS Batch
   * POST /api/sync-active-jobs/
   */
  syncActiveJobs: async (): Promise<{ message: string; synced_count: number }> => {
    const response = await api.post<{ message: string; synced_count: number }>(
      API_ENDPOINTS.JOBS.SYNC_ACTIVE_JOBS,
      {}
    )
    return response.data
  },

  /**
   * Get comprehensive pipeline status including HLA job
   * GET /api/pipeline-status/{job_id}/
   */
  getPipelineStatus: async (jobId: string): Promise<PipelineStatusResponse> => {
    const response = await api.get<PipelineStatusResponse>(API_ENDPOINTS.JOBS.PIPELINE_STATUS(jobId))
    return response.data
  },

  /**
   * Submit a standalone arcasHLA job
   * POST /api/submit-arcas-hla/
   */
  submitArcasHlaJob: async (data: ArcasHlaSubmissionDto): Promise<ArcasHlaSubmissionResponse> => {
    const response = await api.post<ArcasHlaSubmissionResponse>(API_ENDPOINTS.JOBS.SUBMIT_ARCAS_HLA, data)
    return response.data
  },

  /**
   * Submit an m6A / MeRIP-seq differential peaks job to AWS Batch.
   * POST /api/submit-m6a/
   *
   * The backend creates a unique output directory (new path per submission)
   * so runs never overwrite each other.
   */
  submitM6aJob: async (data: M6aSubmissionDto): Promise<M6aSubmissionResponse> => {
    const response = await api.post<M6aSubmissionResponse>(API_ENDPOINTS.JOBS.SUBMIT_M6A, data)
    return response.data
  },

  /**
   * Pre-flight validation for m6A S3 paths. The backend scans both baseline/
   * and intervention/ prefixes and reports per-side .bam counts plus whether
   * the subset-mode naming convention is satisfied. Does NOT submit a job,
   * call Batch, or create any DB rows — safe to call on every field blur.
   *
   * POST /api/validate-m6a-paths/
   */
  validateM6aPaths: async (
    data: M6aValidationDto,
  ): Promise<M6aValidationResponse> => {
    const response = await api.post<M6aValidationResponse>(
      API_ENDPOINTS.JOBS.VALIDATE_M6A_PATHS,
      data,
    )
    return response.data
  },

  /**
   * Pre-flight scan of an S3 path for .bam files. Used by the preprocessing
   * form to give the user immediate feedback ("found 4 BAM files" / "no
   * BAMs here") without having to click Submit and wait for a 400 from the
   * real submission endpoint.
   *
   * Backed by POST /api/validate-s3-path/ which:
   *   - returns 200 with valid=true   when >= 2 BAMs are present
   *   - returns 400 with valid=false  when exactly 1 BAM is present
   *   - returns 404 with valid=false  when no BAMs or bucket missing
   *
   * We swallow the non-2xx into a structured object so the caller can
   * just read ``{valid, error, file_count, files, message}`` and paint a
   * badge.
   */
  validateS3Path: async (s3Path: string): Promise<ValidateS3Response> => {
    try {
      const response = await api.post<ValidateS3Response>(
        API_ENDPOINTS.JOBS.VALIDATE_S3_PATH,
        { s3_path: s3Path },
      )
      return response.data
    } catch (err: any) {
      const data = err?.response?.data
      if (data && typeof data === 'object') {
        return {
          valid: Boolean(data.valid),
          error: data.error,
          file_count: data.file_count,
          files: data.files,
          message: data.message,
        }
      }
      return { valid: false, error: 'Could not reach the validator.' }
    }
  },

  /**
   * List m6A jobs for the current user.
   * GET /api/submit-m6a/
   */
  getM6aJobs: async (): Promise<M6aJobData[]> => {
    const response = await api.get<M6aJobData[]>(API_ENDPOINTS.JOBS.SUBMIT_M6A)
    return response.data
  },

  /**
   * Get a single m6A job by its database primary key.
   * GET /api/submit-m6a/{id}/
   */
  getM6aJobById: async (id: number | string): Promise<M6aJobData> => {
    const response = await api.get<M6aJobData>(`${API_ENDPOINTS.JOBS.SUBMIT_M6A}${id}/`)
    return response.data
  },

  s3Presign: async (s3Path: string): Promise<{ type: string; url?: string; name?: string; size?: number; files?: {name:string;key:string;size:number;url:string}[] }> => {
    const response = await api.get(`${API_ENDPOINTS.JOBS.S3_PRESIGN}?path=${encodeURIComponent(s3Path)}`)
    return response.data
  },
}

export type M6aMode = 'full' | 'subset'

/** Shape returned by GET /api/submit-m6a/ and GET /api/submit-m6a/<id>/. */
export interface M6aJobData {
  id: number
  job_id: string
  job_name: string
  mode?: M6aMode
  run_folder: string
  s3_baseline: string
  s3_intervention: string
  s3_output: string
  s3_logs: string
  baseline_file_count: number
  intervention_file_count: number
  job_queue: string
  job_definition: string
  status: string
  failure_reason?: string | null
  created_at: string
  updated_at: string
}

export interface M6aSubmissionDto {
  s3_baseline: string
  s3_intervention: string
  /** Pipeline variant. 'full' uses /app/run_diff_tress.sh, 'subset' uses /app/run_diff_tress_subset.sh. */
  mode?: M6aMode
  job_name?: string
  s3_output?: string
  s3_logs?: string
}

export interface M6aSubmissionResponse {
  message: string
  jobId: string
  jobName: string
  /** Unique run tag (e.g. m6a-subset-20260423-144501). */
  runTag?: string
  /** Legacy alias retained for older payloads. */
  runFolder?: string
  mode?: M6aMode
  s3_output: string
  s3_logs: string
  output_base?: string
  script?: string
  baseline_file_count: number
  intervention_file_count: number
  job_queue: string
  job_definition: string
  kms_configured: boolean
  m6a: any
}

export interface M6aValidationDto {
  s3_baseline: string
  s3_intervention: string
  mode?: M6aMode
}

export interface M6aValidationSideResult {
  path: string
  total: number
  matched: number
  paired: number
  // Legacy field retained for compatibility with older backend payloads.
  fivepersubset?: number
  ok: boolean
  error: string | null
}

export interface M6aValidationResponse {
  ok: boolean
  mode: M6aMode
  baseline: M6aValidationSideResult
  intervention: M6aValidationSideResult
  error: string | null
}

export interface ValidateS3Response {
  valid: boolean
  error?: string
  file_count?: number
  files?: string[]
  message?: string
}
