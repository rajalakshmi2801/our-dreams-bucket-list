import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail, emailTemplates } from '@/lib/email';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const {
      creatorEmail,
      creatorName,
      creatorUsername,
      creatorPassword,
      fulfillerEmail,
      fulfillerName,
      fulfillerUsername,
      fulfillerPassword
    } = body;

    // Validate all required fields
    if (!creatorEmail || !creatorName || !creatorUsername || !creatorPassword ||
        !fulfillerEmail || !fulfillerName || !fulfillerUsername || !fulfillerPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(creatorEmail)) {
      return NextResponse.json({ error: 'Invalid creator email format' }, { status: 400 });
    }
    if (!emailRegex.test(fulfillerEmail)) {
      return NextResponse.json({ error: 'Invalid partner email format' }, { status: 400 });
    }

    // Check same email
    if (creatorEmail.toLowerCase() === fulfillerEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Creator and partner emails must be different' }, { status: 400 });
    }

    // Check password length
    if (creatorPassword.length < 6 || fulfillerPassword.length < 6) {
      return NextResponse.json({ error: 'Passwords must be at least 6 characters' }, { status: 400 });
    }

    // Check if emails already exist
    const { data: existingEmails } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .in('email', [creatorEmail, fulfillerEmail]);

    if (existingEmails && existingEmails.length > 0) {
      const takenEmails = existingEmails.map(e => e.email);
      if (takenEmails.includes(creatorEmail) && takenEmails.includes(fulfillerEmail)) {
        return NextResponse.json({ error: 'Both emails are already registered. Please login instead.' }, { status: 409 });
      }
      if (takenEmails.includes(creatorEmail)) {
        return NextResponse.json({ error: 'Your email is already registered. Please login instead.' }, { status: 409 });
      }
      if (takenEmails.includes(fulfillerEmail)) {
        return NextResponse.json({ error: "Your partner's email is already registered with another couple." }, { status: 409 });
      }
    }

    // Check if usernames already exist
    const { data: existingUsernames } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .in('username', [creatorUsername, fulfillerUsername]);

    if (existingUsernames && existingUsernames.length > 0) {
      return NextResponse.json({ error: 'Username already taken. Please try registering again.' }, { status: 409 });
    }

    // Hash passwords
    const hashedCreatorPassword = await bcrypt.hash(creatorPassword, 10);
    const hashedFulfillerPassword = await bcrypt.hash(fulfillerPassword, 10);

    // Step 1: Create couple record
    const { data: couple, error: coupleError } = await supabaseAdmin
      .from('couples')
      .insert({
        creator_email: creatorEmail,
        fulfiller_email: fulfillerEmail,
        creator_name: creatorName,
        fulfiller_name: fulfillerName,
        creator_username: creatorUsername,
        fulfiller_username: fulfillerUsername
      })
      .select()
      .single();

    if (coupleError) {
      console.error('Couple creation error:', coupleError);
      return NextResponse.json({ error: 'Failed to create couple. Please try again.' }, { status: 500 });
    }

    // Step 2: Generate UUIDs
    const creatorId = crypto.randomUUID();
    const fulfillerId = crypto.randomUUID();

    // Step 3: Create creator profile
    const { error: creatorProfileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: creatorId,
        username: creatorUsername,
        full_name: creatorName,
        email: creatorEmail,
        couple_id: couple.id,
        role: 'creator',
        password: hashedCreatorPassword
      });

    if (creatorProfileError) {
      console.error('Creator profile error:', creatorProfileError);
      // Cleanup: delete the couple record
      await supabaseAdmin.from('couples').delete().eq('id', couple.id);

      if (creatorProfileError.code === '23505') {
        return NextResponse.json({ error: 'Email or username already taken. Please try again.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create your profile. Please try again.' }, { status: 500 });
    }

    // Step 4: Create fulfiller profile
    const { error: fulfillerProfileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: fulfillerId,
        username: fulfillerUsername,
        full_name: fulfillerName,
        email: fulfillerEmail,
        couple_id: couple.id,
        role: 'fulfiller',
        password: hashedFulfillerPassword
      });

    if (fulfillerProfileError) {
      console.error('Fulfiller profile error:', fulfillerProfileError);
      // Cleanup: delete creator profile and couple
      await supabaseAdmin.from('profiles').delete().eq('id', creatorId);
      await supabaseAdmin.from('couples').delete().eq('id', couple.id);

      if (fulfillerProfileError.code === '23505') {
        return NextResponse.json({ error: "Partner's email or username already taken. Please try again." }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to create partner's profile. Please try again." }, { status: 500 });
    }

    // Step 5: Update couple with user IDs
    await supabaseAdmin
      .from('couples')
      .update({ creator_id: creatorId, fulfiller_id: fulfillerId })
      .eq('id', couple.id);

    // Step 6: Send welcome emails (non-blocking)
    try {
      await sendEmail(
        creatorEmail,
        emailTemplates.welcome(creatorName, creatorUsername, creatorPassword, 'creator').subject,
        emailTemplates.welcome(creatorName, creatorUsername, creatorPassword, 'creator').html
      );
    } catch { /* non-blocking */ }

    try {
      await sendEmail(
        fulfillerEmail,
        emailTemplates.welcome(fulfillerName, fulfillerUsername, fulfillerPassword, 'fulfiller').subject,
        emailTemplates.welcome(fulfillerName, fulfillerUsername, fulfillerPassword, 'fulfiller').html
      );
    } catch { /* non-blocking */ }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Check your emails for login credentials.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again later.' },
      { status: 500 }
    );
  }
}
