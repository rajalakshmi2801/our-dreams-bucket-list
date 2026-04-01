import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail, emailTemplates } from '@/lib/email';
import { generateOTP } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { email, type, creatorEmail } = body;
    // type: 'creator' | 'fulfiller'
    // creatorEmail: only sent when type === 'fulfiller' (the email from step 1)

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    // Check if this email already exists in profiles
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, couple_id')
      .eq('email', email)
      .maybeSingle();

    if (profileCheckError) {
      return NextResponse.json(
        { error: 'Unable to verify email. Please try again.' },
        { status: 500 }
      );
    }

    if (existingProfile) {
      if (type === 'creator') {
        // Creator email already registered
        return NextResponse.json(
          {
            error: 'This email is already registered! Please login with your existing credentials.',
            code: 'EMAIL_EXISTS'
          },
          { status: 409 }
        );
      }

      if (type === 'fulfiller') {
        // Partner email already exists - naughty scenario!
        // Find the original creator who registered this partner
        const { data: originalCreator } = await supabaseAdmin
          .from('profiles')
          .select('email, full_name')
          .eq('couple_id', existingProfile.couple_id)
          .eq('role', 'creator')
          .maybeSingle();

        // Send alert email to the original creator
        if (originalCreator?.email) {
          try {
            const alertEmail = emailTemplates.partnerEmailAlert(
              originalCreator.email,
              creatorEmail || 'Unknown'
            );
            await sendEmail(originalCreator.email, alertEmail.subject, alertEmail.html);
          } catch {
            // Alert email failure shouldn't block the response
          }
        }

        return NextResponse.json(
          {
            error: "Ooh caught! This partner is already registered with someone else. Looks like someone's being a little naughty here! Their partner has been notified.",
            code: 'PARTNER_TAKEN'
          },
          { status: 409 }
        );
      }
    }

    // Check if creator and fulfiller emails are the same
    if (type === 'fulfiller' && creatorEmail && email.toLowerCase() === creatorEmail.toLowerCase()) {
      return NextResponse.json(
        {
          error: "You can't use the same email for both you and your partner!",
          code: 'SAME_EMAIL'
        },
        { status: 400 }
      );
    }

    // Generate and store OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const { error: insertError } = await supabaseAdmin
      .from('otps')
      .insert({
        email,
        otp_code: otp,
        expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to generate OTP. Please try again.' },
        { status: 500 }
      );
    }

    // Send OTP via email
    const emailResult = await sendEmail(
      email,
      'Your OTP for Email Verification',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ec489a;">Email Verification</h2>
          <p>Your OTP code is:</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <strong style="font-size: 32px; color: #ec489a; letter-spacing: 5px;">${otp}</strong>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please check the email address and try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
