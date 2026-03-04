import { cookies } from 'next/headers'

export interface SessionUser {
  email: string
  userType: 'me' | 'partner'
  name: string
  loggedInAt: string
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return null
    }

    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

export async function logout() {
  'use server'
  cookies().delete('session')
}