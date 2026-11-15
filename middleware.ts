import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { HTTP_STATUS, API_MESSAGES } from '@/lib/apiConfig';

export function middleware(request: NextRequest) {
  // Protect all /api/admin/* routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const adminPin = request.headers.get('x-admin-pin');
    
    // Hardcoded PIN (You can move this to .env later: process.env.ADMIN_PIN)
    const expectedPin = process.env.ADMIN_PIN || '999999';
    
    if (adminPin !== expectedPin) {
      return NextResponse.json(
        { success: false, message: API_MESSAGES.AUTH.ADMIN_PIN_INVALID },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/admin/:path*',
};
