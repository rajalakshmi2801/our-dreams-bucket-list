import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Get profile
    const { data: profile, error: fetchError } = await supabase
      .from('couple_profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!profile.verified) {
      return NextResponse.json(
        { error: 'Please verify your email first. Check your inbox for the verification link.' },
        { status: 401 }
      )
    }

    // Determine user type based on password
    let userType = null
    if (password === profile.my_password) {
      userType = 'me'
    } else if (password === profile.partner_password) {
      userType = 'partner'
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create session data with login timestamp
    const sessionData = {
      email: profile.email,
      userType,
      name: userType === 'me' ? profile.my_name : profile.partner_name,
      loggedInAt: new Date().toISOString() // Store login time
    }

    // Create response
    const response = NextResponse.json({ 
      success: true,
      user: sessionData
    })

    // Set cookie with 2 minute expiry for testing (120 seconds)
    response.cookies.set({
      name: 'session',
      value: JSON.stringify(sessionData),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2, // 2 hours in seconds (7200)
      path: '/',
    })

    return response
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
