export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/proxy/api/auth/register/',
    LOGIN: '/proxy/api/auth/login/',
    LOGOUT: '/proxy/api/auth/logout/',
    PROFILE: '/proxy/api/auth/profile/',
    CHANGE_PASSWORD: '/proxy/api/auth/change-password/',
    REFRESH: '/proxy/api/auth/token/refresh/',
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
  },
  JOBS: {
    SUBMIT: '/proxy/api/submit-job/',
    SUBMIT_PREPROCESSING: '/proxy/api/submit-preprocessing/',
    SUBMIT_NEOANTIGEN: '/proxy/api/submit-neoantigen/',
    PIPELINE_CONFIG: '/proxy/api/pipeline-config/',
  },
} as const
