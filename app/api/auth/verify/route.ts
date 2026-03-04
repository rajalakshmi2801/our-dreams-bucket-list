import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json()

    // Get profile
    const { data: profile, error: fetchError } = await supabase
      .from('couple_profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (profile.verified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Verify token
    if (profile.verification_token !== token) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    // Update verification status - SINGLE update for the email
    const { error: updateError } = await supabase
      .from('couple_profiles')
      .update({ 
        verified: true,
        verification_token: null // Clear token after use
      })
      .eq('email', email)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to verify' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully! Both you and your partner can now login with your respective passwords.'
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}