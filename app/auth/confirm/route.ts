import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: {
            name: string
            value: string
            options?: {
              path?: string
              maxAge?: number
              domain?: string
              secure?: boolean
              sameSite?: 'lax' | 'strict' | 'none'
              httpOnly?: boolean
            }
          }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Ignore
            }
          },
        },
      }
    )

    // Valid email OTP types only
    const validTypes = ['signup', 'email', 'magiclink', 'recovery', 'invite', 'email_change']
    
    if (validTypes.includes(type)) {
      const { error } = await supabase.auth.verifyOtp({
        type: type as 'signup' | 'email' | 'magiclink' | 'recovery' | 'invite' | 'email_change',
        token_hash,
      })

      if (!error) {
        return NextResponse.redirect(new URL('/login?verified=true', request.url))
      }
    }
  }

  // Return to login with error
  return NextResponse.redirect(new URL('/login?verified=false', request.url))
}