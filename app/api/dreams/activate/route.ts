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

    const { dreamId, userId } = body;

    if (!dreamId || !userId) {
      return NextResponse.json({ error: 'Dream ID and user ID are required' }, { status: 400 });
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

    if (dream.status !== 'pending') {
      return NextResponse.json({ error: 'This dream is already being worked on' }, { status: 400 });
    }

    // You can't activate your own dream - only your partner can
    if (dream.created_by === userId) {
      return NextResponse.json({ error: "You can't start your own dream - your partner does this!" }, { status: 403 });
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

    // Update dream status
    const { error: updateError } = await supabaseAdmin
      .from('dreams')
      .update({
        status: 'active',
        activated_at: new Date().toISOString(),
        activated_by: userId
      })
      .eq('id', dreamId);

    if (updateError) {
      console.error('Dream activate error:', updateError);
      return NextResponse.json({ error: 'Failed to activate dream. Please try again.' }, { status: 500 });
    }

    // Notify the dream creator that their partner started
    try {
      await sendEmail(
        dreamCreator.email,
        emailTemplates.dreamActivated(currentUser.full_name, dream.title, dreamCreator.full_name).subject,
        emailTemplates.dreamActivated(currentUser.full_name, dream.title, dreamCreator.full_name).html
      );
    } catch { /* non-blocking */ }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Activate dream error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
