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

    const { dreamId, userId, notes } = body;

    if (!dreamId || !userId) {
      return NextResponse.json({ error: 'Dream ID and user ID are required' }, { status: 400 });
    }

    if (!notes || notes.trim().length === 0) {
      return NextResponse.json({ error: 'Please add a note about how you fulfilled this dream' }, { status: 400 });
    }

    // Get dream
    const { data: dream, error: dreamError } = await supabaseAdmin
      .from('dreams')
      .select('*')
      .eq('id', dreamId)
      .single();

    if (dreamError || !dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    if (dream.status !== 'active') {
      return NextResponse.json({ error: 'This dream is not currently active' }, { status: 400 });
    }

    // You can't fulfill your own dream
    if (dream.created_by === userId) {
      return NextResponse.json({ error: "You can't fulfill your own dream - your partner does this!" }, { status: 403 });
    }

    // Get profiles for email
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('couple_id', dream.couple_id);

    if (profileError || !profiles) {
      return NextResponse.json({ error: 'Failed to load profiles. Please try again.' }, { status: 500 });
    }

    const dreamCreator = profiles.find(p => p.id === dream.created_by);
    const currentUser = profiles.find(p => p.id === userId);

    if (!dreamCreator || !currentUser) {
      return NextResponse.json({ error: 'Couple profiles not found' }, { status: 404 });
    }

    // Create fulfillment request
    const { error: requestError } = await supabaseAdmin
      .from('fulfillment_requests')
      .insert({
        dream_id: dreamId,
        requested_by: userId,
        notes: notes.trim(),
        status: 'pending'
      });

    if (requestError) {
      console.error('Fulfillment request error:', requestError);
      return NextResponse.json({ error: 'Failed to submit request. Please try again.' }, { status: 500 });
    }

    // Update dream status
    const { error: updateError } = await supabaseAdmin
      .from('dreams')
      .update({ status: 'fulfillment_requested' })
      .eq('id', dreamId);

    if (updateError) {
      console.error('Dream status update error:', updateError);
      return NextResponse.json({ error: 'Request submitted but status update failed. Please refresh.' }, { status: 500 });
    }

    // Send email (non-blocking)
    try {
      await sendEmail(
        dreamCreator.email,
        emailTemplates.fulfillmentRequested(currentUser.full_name, dream.title, dreamCreator.full_name).subject,
        emailTemplates.fulfillmentRequested(currentUser.full_name, dream.title, dreamCreator.full_name).html
      );
    } catch { /* non-blocking */ }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Request fulfillment error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
