// website/middleware.ts - Add rate limiting and security headers
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Implement rate limiting logic here
    // You can use services like Upstash Redis or simple in-memory storage
  }

  return response
}

export const config = {
  matcher: ['/api/:path*']
}