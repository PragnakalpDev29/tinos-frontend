import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API || 'https://patriotic-reena-choregraphically.ngrok-free.dev'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PUT')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PATCH')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/')
    const backendPath = mapProxyPathToBackend(path)
    const url = `${BACKEND_URL}${backendPath}`

    const searchParams = request.nextUrl.searchParams.toString()
    const fullUrl = searchParams ? `${url}?${searchParams}` : url

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (method !== 'GET' && method !== 'DELETE') {
      const body = await request.text()
      if (body) {
        options.body = body
      }
    }

    const response = await fetch(fullUrl, options)

    const data = await response.text()
    let jsonData
    try {
      jsonData = JSON.parse(data)
    } catch {
      jsonData = data
    }

    return NextResponse.json(jsonData, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      {
        error: 'Proxy request failed',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

function mapProxyPathToBackend(proxyPath: string): string {
  const pathMap: Record<string, string> = {
    'auth/token': '/api/auth/token/refresh/',
    'auth/authenticate': '/api/v1/authenticate/',
    'auth/register': '/api/auth/register/',
    'auth/logout': '/api/v1/logout/',
    'auth/refresh': '/api/v1/refresh/',
    'auth/otp-verification': '/api/v1/otp-verification/',
    'auth/me': '/api/v1/users/me/',
    'auth/terms/current': '/api/v1/terms/current/',
  }

  if (pathMap[proxyPath]) {
    return pathMap[proxyPath]
  }

  // Handle paths that already start with api/
  if (proxyPath.startsWith('api/')) {
    return `/${proxyPath}/`
  }

  // Default fallback for legacy paths
  return `/api/v1/${proxyPath}/`
}
