// middleware.ts - Next.js Middleware kiểm tra auth
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes yêu cầu đăng nhập
const PROTECTED_ROUTES = ['/checkout', '/orders', '/profile']
// Routes chỉ dành cho admin
const ADMIN_ROUTES = ['/dashboard']
// Routes chỉ cho guest (chưa đăng nhập)
const GUEST_ONLY_ROUTES = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Đọc auth cookie (set sau khi login thành công)
  const authCookie = request.cookies.get('auth_user')
  const isAuthenticated = !!authCookie

  // Redirect guest khỏi protected routes
  if (PROTECTED_ROUTES.some(r => pathname.startsWith(r)) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated user khỏi guest-only routes
  if (GUEST_ONLY_ROUTES.some(r => pathname.startsWith(r)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}