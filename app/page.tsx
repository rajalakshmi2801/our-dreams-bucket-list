'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Heart } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
    checkUser()
  }, [router])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="relative">
        <Heart className="w-24 h-24 text-pink-500 animate-pulse" fill="currentColor" />
        <Heart className="w-24 h-24 text-purple-500 absolute top-0 left-0 animate-ping opacity-75" fill="currentColor" />
      </div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-6">
        Our Dreams
      </h1>
      <p className="text-gray-500 mt-2">Loading your love story...</p>
    </div>
  )
}