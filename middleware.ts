import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge-compatible JWT verification (no Node.js crypto needed)
async function verifyJWT(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Verify signature using Web Crypto API (Edge-compatible)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureInput = encoder.encode(`${headerB64}.${payloadB64}`);
    // Convert base64url to ArrayBuffer
    const signature = Uint8Array.from(
      atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const isValid = await crypto.subtle.verify('HMAC', key, signature, signatureInput);
    if (!isValid) return false;

    // Check expiration
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/auth/login' || path === '/auth/register' || path === '/';
  const isApiPath = path.startsWith('/api/');

  // Don't interfere with API routes
  if (isApiPath) return NextResponse.next();

  const token = request.cookies.get('token')?.value || '';
  const secret = process.env.JWT_SECRET || 'supersecret';

  // Verify token is actually valid (not just present)
  let isAuthenticated = false;
  if (token) {
    isAuthenticated = await verifyJWT(token, secret);

    // If token is invalid/expired, clear it
    if (!isAuthenticated) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.set({
        name: 'token',
        value: '',
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 0
      });
      return response;
    }
  }

  // Authenticated users on public pages -> redirect to dashboard
  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Unauthenticated users on protected pages -> redirect to login
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/dashboard/:path*',
    '/dreams/:path*'
  ]
};
