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

    const { dreamId, userId, approved } = body;

    if (!dreamId || !userId) {
      return NextResponse.json({ error: 'Dream ID and user ID are required' }, { status: 400 });
    }

    if (typeof approved !== 'boolean') {
      return NextResponse.json({ error: 'Approval status is required' }, { status: 400 });
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

    if (dream.status !== 'fulfillment_requested') {
      return NextResponse.json({ error: 'This dream does not have a pending fulfillment request' }, { status: 400 });
    }

    // Only the person who created this dream can verify
    if (dream.created_by !== userId) {
      return NextResponse.json({ error: 'Only the dream creator can verify fulfillment' }, { status: 403 });
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
    const partner = profiles.find(p => p.id !== dream.created_by);

    if (!dreamCreator || !partner) {
      return NextResponse.json({ error: 'Couple profiles not found' }, { status: 404 });
    }

    if (approved) {
      const { error: completeError } = await supabaseAdmin
        .from('dreams')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: userId
        })
        .eq('id', dreamId);

      if (completeError) {
        console.error('Dream complete error:', completeError);
        return NextResponse.json({ error: 'Failed to mark dream as completed. Please try again.' }, { status: 500 });
      }

      await supabaseAdmin
        .from('fulfillment_requests')
        .update({ status: 'approved', responded_at: new Date().toISOString() })
        .eq('dream_id', dreamId)
        .eq('status', 'pending');

      try {
        await sendEmail(
          partner.email,
          emailTemplates.fulfillmentApproved(dreamCreator.full_name, dream.title, partner.full_name).subject,
          emailTemplates.fulfillmentApproved(dreamCreator.full_name, dream.title, partner.full_name).html
        );
      } catch { /* non-blocking */ }
    } else {
      const { error: rejectError } = await supabaseAdmin
        .from('dreams')
        .update({ status: 'active' })
        .eq('id', dreamId);

      if (rejectError) {
        console.error('Dream reject error:', rejectError);
        return NextResponse.json({ error: 'Failed to update dream status. Please try again.' }, { status: 500 });
      }

      await supabaseAdmin
        .from('fulfillment_requests')
        .update({ status: 'rejected', responded_at: new Date().toISOString() })
        .eq('dream_id', dreamId)
        .eq('status', 'pending');

      try {
        await sendEmail(
          partner.email,
          emailTemplates.fulfillmentRejected(dreamCreator.full_name, dream.title, partner.full_name).subject,
          emailTemplates.fulfillmentRejected(dreamCreator.full_name, dream.title, partner.full_name).html
        );
      } catch { /* non-blocking */ }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify fulfillment error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
