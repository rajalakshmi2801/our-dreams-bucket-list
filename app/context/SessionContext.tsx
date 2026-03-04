'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export type User = {
  email: string
  userType: 'me' | 'partner'
  name: string
}

type SessionContextType = {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const hasChecked = useRef(false)

  const checkSession = async () => {
    // Prevent multiple simultaneous calls
    if (hasChecked.current) return
    
    try {
      hasChecked.current = true
      console.log('🔍 Checking session...')
      const response = await fetch('/api/auth/session', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      
      if (data.authenticated) {
        console.log('✅ User authenticated:', data.user)
        setUser(data.user)
      } else {
        console.log('❌ No authenticated user')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Session check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    console.log('🔄 Refreshing session...')
    setLoading(true)
    hasChecked.current = false
    await checkSession()
  }

  const logout = async () => {
    try {
      console.log('🚪 Logging out...')
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      hasChecked.current = false
      router.push('/login')
    } catch (error) {
      console.error('❌ Logout failed:', error)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <SessionContext.Provider value={{ user, loading, logout, refreshSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}