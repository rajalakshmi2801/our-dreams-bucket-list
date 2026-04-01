import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    if (typeof otp !== 'string' || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'OTP must be a 6-digit number' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('otps')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('OTP lookup error:', error);
      return NextResponse.json(
        { error: 'Verification failed. Please try again.' },
        { status: 500 }
      );
    }

    if (!data) {
      // Check if OTP exists but expired
      const { data: expiredOtp } = await supabaseAdmin
        .from('otps')
        .select('id')
        .eq('email', email)
        .eq('otp_code', otp)
        .eq('verified', false)
        .lte('expires_at', new Date().toISOString())
        .maybeSingle();

      if (expiredOtp) {
        return NextResponse.json(
          { error: 'OTP has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Invalid OTP. Please check and try again.' },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    const { error: updateError } = await supabaseAdmin
      .from('otps')
      .update({ verified: true })
      .eq('id', data.id);

    if (updateError) {
      console.error('OTP update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify OTP. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
