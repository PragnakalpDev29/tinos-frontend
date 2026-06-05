import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { hasAccess } from './lib/utils/auth-helpers'


const publicEndpoints = ['/login', '/register', '/forgot-password', '/reset-password']

const isRootPath = (pathname: string) => pathname === '/'

export async function proxy(req: NextRequest) {
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
}

export default proxy

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/dashboard',
    '/dashboard/:path*',
    '/appointments',
    '/neoantigen',
    '/neoantigen-jobs',
    '/pipeline-config',
    '/jobs',
    '/preprocessing',
    '/preprocessing-jobs',
    '/profile',
    '/s3-upload',
    '/settings',
  ],
}