import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import axios from 'axios'

const isProduction = process.env.NODE_ENV === 'production'

/** Single client-safe message for any refresh failure (no upstream/stack leakage). */
const PUBLIC_REFRESH_ERROR_DETAIL =
  'Unable to refresh session. Please sign in again.'

function logRefreshFailure(scope: string, error: unknown, extra?: Record<string, unknown>) {
  if (isProduction) {
    const err = error as {
      message?: string
      response?: { status?: number; data?: unknown }
      code?: string
    }
    console.error(`[refresh-access] ${scope}`, {
      ...extra,
      status: err?.response?.status,
      axiosCode: err?.code,
      message: err?.message,
    })
  } else {
    console.error(`[refresh-access] ${scope}`, error, extra)
  }
}

/**
 * Server-side access-token refresh helper.
 *
 * The NextAuth session callback deliberately strips the refresh token before
 * it reaches the browser. When a protected API call gets a 401 (the JWT access
 * token expired), the client cannot refresh on its own. It calls THIS route,
 * which:
 *
 *   1. Reads the server-side NextAuth JWT via getToken() — this JWT still
 *      contains the refresh token.
 *   2. Calls the Django token-refresh endpoint with that refresh token.
 *   3. Returns the new access token to the browser so it can retry the
 *      originally-failed request.
 *
 * The refresh token itself is never exposed to client JavaScript.
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    const refreshToken = (token as any)?.refresh
    if (!refreshToken) {
      if (isProduction) {
        console.error('[refresh-access] missing refresh token in session JWT')
      }
      return NextResponse.json(
        {
          error: 'no_refresh_token',
          detail: isProduction
            ? PUBLIC_REFRESH_ERROR_DETAIL
            : 'Session has no refresh token. Please sign in again.',
        },
        { status: 401 },
      )
    }

    const BACKEND_URL = process.env.BACKEND_API_URL
    if (!BACKEND_URL) {
      logRefreshFailure('BACKEND_API_URL missing', new Error('not configured'))
      return NextResponse.json(
        {
          error: 'server_misconfigured',
          detail: isProduction
            ? 'Service temporarily unavailable. Please try again later.'
            : 'BACKEND_API_URL is not configured',
        },
        { status: 500 },
      )
    }

    const res = await axios.post(
      `${BACKEND_URL}/api/auth/token/refresh/`,
      { refresh: refreshToken },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15000 },
    )

    const newAccess: string | undefined = res.data?.access
    if (!newAccess) {
      logRefreshFailure('upstream_missing_access', new Error('empty access in response'))
      return NextResponse.json(
        {
          error: 'refresh_failed',
          detail: isProduction
            ? PUBLIC_REFRESH_ERROR_DETAIL
            : 'Upstream did not return an access token',
        },
        { status: 502 },
      )
    }

    return NextResponse.json({ access: newAccess }, { status: 200 })
  } catch (error: any) {
    const status =
      typeof error?.response?.status === 'number' &&
      error.response.status >= 400 &&
      error.response.status < 600
        ? error.response.status
        : 500

    logRefreshFailure('axios_or_refresh', error)

    if (isProduction) {
      return NextResponse.json(
        { error: 'refresh_failed', detail: PUBLIC_REFRESH_ERROR_DETAIL },
        { status },
      )
    }

    const detail =
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      error?.message ||
      'Refresh failed'
    return NextResponse.json(
      { error: 'refresh_failed', detail: String(detail) },
      { status },
    )
  }
}
