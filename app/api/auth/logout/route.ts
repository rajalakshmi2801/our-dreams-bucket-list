import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })
    
    // Clear the session cookie
    response.cookies.set({
      name: 'session',
      value: '',
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}