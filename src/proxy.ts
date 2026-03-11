import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy (the new name for Middleware in Next.js 16+)
 * protects all dashboard routes using the accessToken cookie.
 */

const PUBLIC_PATHS = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
]

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Always allow static files, Next.js internals, and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/proxy') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // 2. Check for ANY authentication cookie:
    // - accessToken (our custom Django JWT cookie)
    // - next-auth.session-token (NextAuth development)
    // - __Secure-next-auth.session-token (NextAuth production)
    const accessToken = request.cookies.get('accessToken')?.value
    const nextAuthToken = request.cookies.get('next-auth.session-token')?.value ||
        request.cookies.get('__Secure-next-auth.session-token')?.value

    // As long as ONE of these exists, we consider the user authenticated for the Proxy check
    const isAuthenticated = !!(accessToken || nextAuthToken)

    const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
    const isRoot = pathname === '/'

    // 3. If user is already authenticated and tries to access public pages (login, register, etc.)
    // redirect them to dashboard since they're already logged in
    if (isAuthenticated && isPublic) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 4. If user is authenticated and on root, redirect to dashboard
    if (isAuthenticated && isRoot) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 5. If user is NOT authenticated and trying to access protected routes
    // redirect them to login
    if (!isAuthenticated && !isPublic && !isRoot) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 6. If user is NOT authenticated and on root, redirect to login
    if (!isAuthenticated && isRoot) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 7. Allow the request to proceed
    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
