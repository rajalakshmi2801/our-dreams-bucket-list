import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Define the type for couple profile
type CoupleProfile = {
  id?: number
  email: string
  my_password: string
  partner_password: string
  my_name: string
  partner_name: string
  verified: boolean
  verification_token: string | null
  created_at: string
}

// Initialize clients with error checking
console.log('🚀 Registration API started')
console.log('📧 Checking Resend API Key:', process.env.RESEND_API_KEY ? '✅ Present' : '❌ Missing')
console.log('🔑 Checking Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Present' : '❌ Missing')
console.log('🔑 Checking Supabase Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing')

// Initialize Resend
let resend: Resend
try {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined in environment variables')
  }
  resend = new Resend(process.env.RESEND_API_KEY)
  console.log('✅ Resend initialized successfully')
} catch (error) {
  console.error('❌ Failed to initialize Resend:', error)
}

// Initialize Supabase with service role key
let supabase: ReturnType<typeof createClient>
try {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
  }
  
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
  console.log('✅ Supabase initialized successfully with service role')
} catch (error) {
  console.error('❌ Failed to initialize Supabase:', error)
}

export async function POST(request: Request) {
  console.log('📝 Registration request received')
  
  try {
    // Parse request body
    const body = await request.json()
    console.log('📦 Request body:', { 
      email: body.email,
      myName: body.myName,
      partnerName: body.partnerName,
      myPassword: '***hidden***', 
      partnerPassword: '***hidden***' 
    })
    
    const { email, myPassword, partnerPassword, myName, partnerName } = body

    // Validate required fields
    if (!email) {
      console.log('❌ Email missing')
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    if (!myPassword) {
      console.log('❌ My password missing')
      return NextResponse.json({ error: 'Your password is required' }, { status: 400 })
    }
    if (!partnerPassword) {
      console.log('❌ Partner password missing')
      return NextResponse.json({ error: 'Partner password is required' }, { status: 400 })
    }

    console.log('✅ All fields validated')

    // Check if email already exists and is verified
    console.log('🔍 Checking if email exists:', email)
    const { data: existingProfile, error: checkError } = await supabase
      .from('couple_profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (checkError) {
      console.error('❌ Database check error:', checkError)
      return NextResponse.json(
        { error: 'Database error: ' + checkError.message },
        { status: 500 }
      )
    }

    // Cast the existingProfile to our type or null
    const profile = existingProfile as CoupleProfile | null

    // If profile exists and is verified, block registration
    if (profile && profile.verified) {
      console.log('❌ Email already registered and verified:', email)
      return NextResponse.json(
        { error: 'Email already registered and verified. Please login.' },
        { status: 400 }
      )
    }

    // If profile exists but is NOT verified, we can re-register (update or replace)
    if (profile && !profile.verified) {
      console.log('⚠️ Email exists but not verified. Will update existing profile.')
      
      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex')
      console.log('🔑 New verification token generated:', verificationToken.substring(0, 10) + '...')
      
      // Update the existing profile with new data
      console.log('💾 Updating existing unverified profile...')
      const { error: updateError } = await supabase
        .from('couple_profiles')
        .update({
          my_password: myPassword,
          partner_password: partnerPassword,
          my_name: myName || 'You',
          partner_name: partnerName || 'Partner',
          verification_token: verificationToken,
          created_at: new Date().toISOString()
        } as never)
        .eq('email', email)

      if (updateError) {
        console.error('❌ Database update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update profile: ' + updateError.message },
          { status: 500 }
        )
      }

      console.log('✅ Profile updated successfully')

      // Send verification email
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const verificationLink = `${baseUrl}/verify?email=${encodeURIComponent(email)}&token=${verificationToken}`
      
      console.log('📧 Attempting to send verification email to:', email)
      console.log('🔗 Verification link:', verificationLink)

      try {
        const emailResponse = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email,
          subject: '✨ Verify Your Couple Account - Our Dreams',
          html: getEmailTemplate(myName || 'You', partnerName || 'Partner', verificationLink)
        })

        console.log('📧 Email API response:', JSON.stringify(emailResponse, null, 2))

        if (emailResponse.error) {
          console.error('❌ Resend API error:', emailResponse.error)
          return NextResponse.json({ 
            success: true, 
            warning: 'Profile updated but email failed to send. Please copy this verification link:',
            verificationLink: verificationLink
          })
        }

        console.log('✅ Verification email sent successfully!')
        
      } catch (emailError: any) {
        console.error('❌ Email sending exception:', emailError)
        return NextResponse.json({ 
          success: true, 
          warning: 'Profile updated but email service error. Please use this link:',
          verificationLink: verificationLink
        })
      }

      return NextResponse.json({ 
        success: true,
        message: 'Profile updated! Please check your email for verification link.',
        email: email
      })
    }

    // NEW REGISTRATION: No existing profile
    console.log('✅ Email is available for new registration')

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    console.log('🔑 Verification token generated:', verificationToken.substring(0, 10) + '...')

    // Store in database
    console.log('💾 Inserting new profile into database...')
    const { error: dbError } = await supabase
      .from('couple_profiles')
      .insert({
        email: email,
        my_password: myPassword,
        partner_password: partnerPassword,
        my_name: myName || 'You',
        partner_name: partnerName || 'Partner',
        verified: false,
        verification_token: verificationToken,
        created_at: new Date().toISOString()
      } as never)

    if (dbError) {
      console.error('❌ Database insert error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create profile: ' + dbError.message },
        { status: 500 }
      )
    }

    console.log('✅ Profile created successfully in database')

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationLink = `${baseUrl}/verify?email=${encodeURIComponent(email)}&token=${verificationToken}`
    
    console.log('📧 Attempting to send verification email to:', email)
    console.log('🔗 Verification link:', verificationLink)

    try {
      const emailResponse = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: '✨ Verify Your Couple Account - Our Dreams',
        html: getEmailTemplate(myName || 'You', partnerName || 'Partner', verificationLink)
      })

      console.log('📧 Email API response:', JSON.stringify(emailResponse, null, 2))

      if (emailResponse.error) {
        console.error('❌ Resend API error:', emailResponse.error)
        return NextResponse.json({ 
          success: true, 
          warning: 'Account created but email failed to send. Please copy this verification link:',
          verificationLink: verificationLink
        })
      }

      console.log('✅ Verification email sent successfully!')

    } catch (emailError: any) {
      console.error('❌ Email sending exception:', emailError)
      return NextResponse.json({ 
        success: true, 
        warning: 'Account created but email service error. Please use this link:',
        verificationLink: verificationLink
      })
    }

    console.log('🎉 Registration completed successfully for:', email)
    
    return NextResponse.json({ 
      success: true,
      message: 'Account created! Please check your email for verification link.',
      email: email
    })
    
  } catch (error: any) {
    console.error('❌ Unexpected error in registration:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function for email template
function getEmailTemplate(myName: string, partnerName: string, verificationLink: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px;">✨ Our Dreams ✨</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Welcome ${myName} & ${partnerName}!</p>
          </div>
          
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Verify Your Email Address</h2>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Thank you for creating your couple account! Please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
                🔐 Verify Email Address
              </a>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">📝 What happens next?</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Click the verification button above</li>
                <li>Your email will be verified for both accounts</li>
                <li>Both you and your partner can login with your own passwords</li>
                <li>Start adding your dreams together!</li>
              </ul>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                ⚡ <strong>Important:</strong> If you didn't create this account, please ignore this email. The verification link will expire in 24 hours.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
              Can't click the button? Copy and paste this link into your browser:<br>
              <span style="color: #667eea; word-break: break-all;">${verificationLink}</span>
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}