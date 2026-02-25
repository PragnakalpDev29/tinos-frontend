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

    const pathname = req.nextUrl.pathname

    if (isRootPath(pathname)) {
      if (_token) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return NextResponse.next()
    }

    const isPublicEndpoint = publicEndpoints.some(
      (endpoint) => pathname === endpoint || pathname.startsWith(endpoint)
    )

    if (isPublicEndpoint) {
      if (_token) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return NextResponse.next()
    }

    if (!_token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (_token?.user?.role?.name) {
      if (!hasAccess(_token.user.role.name, pathname)) {
        const response = NextResponse.rewrite(new URL('/403', req.url), {
          status: 403,
        })
        response.headers.set('x-errorCode', '403')
        return response
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: async ({ req, token }) => {
        const _token = await getToken({ req })
        const pathname = req.nextUrl.pathname

        if (isRootPath(pathname)) {
          return true
        }

        const isPublicEndpoint = publicEndpoints.some(
          (endpoint) => pathname === endpoint || pathname.startsWith(endpoint)
        )

        if (isPublicEndpoint) {
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
