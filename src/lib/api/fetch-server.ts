/**
 * Fetch Utility for Server Components
 * Use this in Server Components (async components without 'use client')
 * Features: Built-in caching, ISR, On-demand revalidation
 *
 * SECURITY: No development artifacts (ngrok headers) in production.
 * API_TOKEN should be rotated regularly and stored in a secrets manager.
 */

const BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8001'
const API_TOKEN = process.env.API_TOKEN

export interface FetchOptions extends RequestInit {
  cache?: RequestCache
  next?: {
    revalidate?: number | false
    tags?: string[]
  }
}

/**
 * Server-side fetch with authentication
 * Default: cache: 'force-cache' (Static Generation)
 */
export async function fetchServer<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  if (API_TOKEN) {
    defaultHeaders['Authorization'] = `Bearer ${API_TOKEN}`
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const res = await fetch(url, config)

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(
        errorData.detail ||
        errorData.error ||
        `HTTP ${res.status}: ${res.statusText}`
      )
    }

    return res.json()
  } catch (error) {
    console.error('Server Fetch Error:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
}

/**
 * Static data - cache indefinitely (until redeployment)
 * Use for: Privacy policy, Terms of service, Static content
 */
export async function fetchStatic<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  return fetchServer<T>(endpoint, {
    ...options,
    cache: 'force-cache',
  })
}

/**
 * Dynamic data - never cache, always fresh
 * Use for: User-specific data, Real-time data
 */
export async function fetchDynamic<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  return fetchServer<T>(endpoint, {
    ...options,
    cache: 'no-store',
  })
}

/**
 * ISR (Incremental Static Regeneration) - revalidate every N seconds
 * Use for: Blog posts, Product listings, Semi-static content
 */
export async function fetchISR<T>(
  endpoint: string,
  revalidateSeconds: number,
  options?: FetchOptions
): Promise<T> {
  return fetchServer<T>(endpoint, {
    ...options,
    next: {
      revalidate: revalidateSeconds,
      ...options?.next,
    },
  })
}

/**
 * Tag-based caching for on-demand revalidation
 * Use for: CMS content, Product data that updates via webhook
 */
export async function fetchWithTags<T>(
  endpoint: string,
  tags: string[],
  options?: FetchOptions
): Promise<T> {
  return fetchServer<T>(endpoint, {
    ...options,
    next: {
      tags,
      ...options?.next,
    },
  })
}

/**
 * POST request for Server Components
 */
export async function postServer<T>(
  endpoint: string,
  data: object,
  options?: FetchOptions
): Promise<T> {
  return fetchServer<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * PUT request for Server Components
 */
export async function putServer<T>(
  endpoint: string,
  data: object,
  options?: FetchOptions
): Promise<T> {
  return fetchServer<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * PATCH request for Server Components
 */
export async function patchServer<T>(
  endpoint: string,
  data: object,
  options?: FetchOptions
): Promise<T> {
  return fetchServer<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * DELETE request for Server Components
 */
export async function deleteServer<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  return fetchServer<T>(endpoint, {
    ...options,
    method: 'DELETE',
  })
}
