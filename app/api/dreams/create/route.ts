import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { userId, coupleId, title, description, category, estimated_date, estimated_cost } = body;

    if (!userId || !coupleId) {
      return NextResponse.json({ error: 'Authentication required. Please login again.' }, { status: 401 });
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Dream title is required' }, { status: 400 });
    }

    if (title.length > 200) {
      return NextResponse.json({ error: 'Dream title is too long (max 200 characters)' }, { status: 400 });
    }

    if (estimated_cost !== null && estimated_cost !== undefined && estimated_cost < 0) {
      return NextResponse.json({ error: 'Budget cannot be negative' }, { status: 400 });
    }

    // Get couple profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('couple_id', coupleId);

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json({ error: 'Failed to load couple data. Please try again.' }, { status: 500 });
    }

    // Find the current user and their partner
    const currentUser = profiles?.find(p => p.id === userId);
    const partner = profiles?.find(p => p.id !== userId);

    if (!currentUser || !partner) {
      return NextResponse.json({ error: 'Couple profiles not found. Please contact support.' }, { status: 404 });
    }

    // Create dream
    const { data: dream, error: createError } = await supabaseAdmin
      .from('dreams')
      .insert({
        couple_id: coupleId,
        created_by: userId,
        title: title.trim(),
        description: description?.trim() || null,
        category: category || null,
        estimated_date: estimated_date || null,
        estimated_cost: estimated_cost || null,
        status: 'pending'
      })
      .select()
      .single();

    if (createError) {
      console.error('Dream creation error:', createError);
      return NextResponse.json({ error: 'Failed to create dream. Please try again.' }, { status: 500 });
    }

    // Send email to partner (non-blocking)
    try {
      await sendEmail(
        partner.email,
        emailTemplates.dreamCreated(currentUser.full_name, title, partner.full_name).subject,
        emailTemplates.dreamCreated(currentUser.full_name, title, partner.full_name).html
      );
    } catch { /* non-blocking */ }

    // Log notification (non-blocking)
    try {
      await supabaseAdmin
        .from('email_notifications')
        .insert({
          user_id: partner.id,
          email: partner.email,
          type: 'dream_created',
          dream_id: dream.id
        });
    } catch { /* non-blocking */ }

    return NextResponse.json({ success: true, dream });
  } catch (error) {
    console.error('Create dream error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
