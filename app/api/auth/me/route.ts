import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) return NextResponse.json({ user: null });

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
      role: string;
      full_name: string;
      email: string;
      couple_id: string;
    };

    return NextResponse.json({
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        full_name: decoded.full_name,
        email: decoded.email,
        couple_id: decoded.couple_id
      }
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
