import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const { pathname } = request.nextUrl

  console.log('🔍 Middleware check:', { 
    pathname, 
    hasSession: !!session,
    sessionValue: session?.value.substring(0, 50) + '...' 
  })

  // Public paths - allow access without session
  if (pathname === '/login' || pathname === '/register' || pathname === '/verify') {
    // If user has session and tries to access login, redirect to dashboard
    if (session) {
      console.log('➡️ User has session, redirecting from login to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Protected paths - require session
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/dreams') || 
      pathname.startsWith('/mutual') || 
      pathname.startsWith('/fulfilled')) {
    
    if (!session) {
      console.log('⛔ No session, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check session expiry
    try {
      const sessionData = JSON.parse(session.value)
      const loginTime = new Date(sessionData.loggedInAt).getTime()
      const now = Date.now()
      const twoHours = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
      
      console.log('⏱️ Session age:', (now - loginTime) / 1000, 'seconds')
      
      // If session is older than 2 hours, clear it
      if (now - loginTime > twoHours) {
        console.log('⏰ Session expired after 2 hours, redirecting to login')
        const response = NextResponse.redirect(new URL('/login?reason=expired', request.url))
        response.cookies.delete('session')
        return response
      }
      
      console.log('✅ Session valid, allowing access')
    } catch (error) {
      console.error('❌ Invalid session, clearing cookie')
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('session')
      return response
    }
  }

  // API routes - don't interfere
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}