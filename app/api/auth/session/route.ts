import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      console.log('📡 Session API: No session cookie found')
      return NextResponse.json({ 
        authenticated: false 
      })
    }

    const session = JSON.parse(sessionCookie.value)
    
    // Check expiry
    const loginTime = new Date(session.loggedInAt).getTime()
    const now = Date.now()
    const twoHours = 2 * 60 * 60 * 1000 // 2 hours
    
    if (now - loginTime > twoHours) {
      console.log('📡 Session API: Session expired')
      return NextResponse.json({ 
        authenticated: false,
        reason: 'expired'
      })
    }
    
    console.log('📡 Session API: Valid session found')
    return NextResponse.json({ 
      authenticated: true,
      user: session 
    })
    
  } catch (error) {
    console.error('📡 Session API error:', error)
    return NextResponse.json({ 
      authenticated: false 
    })
  }
}