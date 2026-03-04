import { createBrowserClient } from '@supabase/ssr'

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: isBrowser ? {
        getItem: (key: string) => {
          try {
            return window.localStorage.getItem(key)
          } catch (e) {
            console.error('Error accessing localStorage:', e)
            return null
          }
        },
        setItem: (key: string, value: string) => {
          try {
            window.localStorage.setItem(key, value)
          } catch (e) {
            console.error('Error setting localStorage:', e)
          }
        },
        removeItem: (key: string) => {
          try {
            window.localStorage.removeItem(key)
          } catch (e) {
            console.error('Error removing from localStorage:', e)
          }
        }
      } : undefined
    },
    global: {
      fetch: (url: string | URL | Request, options: RequestInit = {}) => {
        return fetch(url, { 
          ...options,
          signal: AbortSignal.timeout?.(30000) ?? undefined,
        })
      },
    },
  }
)