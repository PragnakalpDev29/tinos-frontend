export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register/',
    LOGIN: '/api/auth/login/',
    LOGOUT: '/api/auth/logout/',
    PROFILE: '/api/auth/profile/',
    CHANGE_PASSWORD: '/api/auth/change-password/',
    REFRESH: '/api/auth/token/refresh/',
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
  },
  JOBS: {
    SUBMIT: '/api/submit-job/',
    SUBMIT_PREPROCESSING: '/api/submit-preprocessing/',
    SUBMIT_NEOANTIGEN: '/api/submit-neoantigen/',
    SUBMIT_ARCAS_HLA: '/api/submit-arcas-hla/',
    PIPELINE_CONFIG: '/api/pipeline-config/',
    PIPELINE_STATUS: (jobId: string) => `/api/pipeline-status/${jobId}/`,
    SYNC_ACTIVE_JOBS: '/api/sync-active-jobs/',
  },
} as const
