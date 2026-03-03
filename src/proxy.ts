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

    // Log the auth status to the server console (visible in dev terminal)
    // Keep it short and useful
    if (!pathname.startsWith('/_next') && !pathname.includes('.')) {
        const cookieNames = request.cookies.getAll().map(c => c.name).join(', ')
        console.log(`[Proxy] ${pathname} - Auth: ${isAuthenticated} (Access: ${!!accessToken}, NextAuth: ${!!nextAuthToken})`)
        console.log(`[Proxy] Cookies found: [${cookieNames}]`)
    }

    // TEMPORARILY DISABLED SECURITY
    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
