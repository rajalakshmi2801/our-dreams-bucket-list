import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Please login to continue' }, { status: 401 });
    }

    let decoded: { id: string; couple_id: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string; couple_id: string };
    } catch {
      return NextResponse.json({ error: 'Session expired. Please login again.' }, { status: 401 });
    }

    if (!decoded.couple_id) {
      return NextResponse.json({ error: 'Account not linked to a couple' }, { status: 400 });
    }

    // mode: 'creator' = my dreams (I created), 'fulfiller' = partner's dreams (partner created)
    const mode = req.nextUrl.searchParams.get('mode') || 'creator';

    let query = supabaseAdmin
      .from('dreams')
      .select('*')
      .eq('couple_id', decoded.couple_id)
      .order('created_at', { ascending: false });

    if (mode === 'creator') {
      // My dreams - I created these
      query = query.eq('created_by', decoded.id);
    } else if (mode === 'fulfiller') {
      // Partner's dreams - I need to fulfill these
      query = query.neq('created_by', decoded.id);
    }

    const { data: dreams, error } = await query;

    if (error) {
      console.error('Dreams fetch error:', error);
      return NextResponse.json({ error: 'Failed to load dreams. Please refresh.' }, { status: 500 });
    }

    return NextResponse.json({ dreams: dreams || [] });
  } catch (error) {
    console.error('Dreams list error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
