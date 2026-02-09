import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import { getToken } from 'next-auth/jwt'
import { hasAccess } from './src/lib/utils/auth-helpers'

const publicEndpoints = ['/login', '/register', '/forgot-password', '/reset-password']

const isRootPath = (pathname: string) => pathname === '/'

export default withAuth(
  async function middleware(req) {
    const _token: any = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (isRootPath(req.nextUrl.pathname)) {
      if (_token) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return NextResponse.next()
    }

    if (
      !_token &&
      publicEndpoints.some(
        (endpoint) =>
          req.nextUrl.pathname === endpoint ||
          req.nextUrl.pathname.startsWith(endpoint)
      )
    ) {
      return NextResponse.next()
    }

    if (
      _token &&
      publicEndpoints.some(
        (endpoint) =>
          req.nextUrl.pathname === endpoint ||
          req.nextUrl.pathname.startsWith(endpoint)
      )
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (_token) {
      if (!hasAccess(_token?.user.role.name, req.nextUrl.pathname)) {
        const response = NextResponse.rewrite(new URL('/403', req.url), {
          status: 403,
        })
        response.headers.set('x-errorCode', '403')
        return response
      }
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/login', req.url))
  },
  {
    callbacks: {
      authorized: async ({ req, token }) => {
        const _token = await getToken({ req })

        if (isRootPath(req.nextUrl.pathname)) {
          return true
        }

        if (
          !_token &&
          publicEndpoints.some(
            (endpoint) =>
              req.nextUrl.pathname === endpoint ||
              req.nextUrl.pathname.startsWith(endpoint)
          )
        ) {
          return true
        }
        return !!_token
      },
    },
  }
)

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/dashboard',
    '/dashboard/:path*',
  ],
}
