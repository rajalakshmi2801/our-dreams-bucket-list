'use client'

import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Dream {
  id: number
  title: string
  description: string
  category: string
  estimated_cost: number
  created_at: string
  created_by: string
  dream_swipes: any[]
  mutual_dreams: any[]
}

export default function Dreams() {
  const [dreams, setDreams] = useState<Dream[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDreams()
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchDreams = async () => {
    const { data } = await supabase
      .from('dreams')
      .select(`
        *,
        dream_swipes(*),
        mutual_dreams(*)
      `)
      .order('created_at', { ascending: false })
    
    setDreams(data || [])
    setLoading(false)
  }

  const handleSwipe = async (dreamId: number, swipedRight: boolean) => {
    if (!currentUser) return

    const { error } = await supabase
      .from('dream_swipes')
      .upsert({
        dream_id: dreamId,
        user_id: currentUser.id,
        swiped_right: swipedRight
      })

    if (!error) {
      // Check if it's now mutual
      const { data: dream } = await supabase
        .from('dreams')
        .select(`
          *,
          dream_swipes!inner(*)
        `)
        .eq('id', dreamId)
        .single()

      const swipes = dream?.dream_swipes || []
      const otherUserSwiped = swipes.some(
        (s: any) => s.user_id !== currentUser.id && s.swiped_right
      )

      if (swipedRight && otherUserSwiped) {
        await supabase
          .from('mutual_dreams')
          .insert({ dream_id: dreamId })
        
        alert('🎉 You both want this! Check "Active Dreams"!')
      }

      fetchDreams()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading your dreams...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-purple-600">Our Dreams 🌟</h1>
            <div className="space-x-4">
              <Link href="/dreams" className="text-gray-700 hover:text-purple-600">
                All Dreams
              </Link>
              <Link href="/mutual" className="text-gray-700 hover:text-purple-600">
                Active Dreams
              </Link>
              <Link href="/dreams/new" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                + New Dream
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dreams.map((dream) => {
            const userSwiped = dream.dream_swipes?.find(
              s => s.user_id === currentUser?.id
            )
            const mutual = dream.mutual_dreams?.length > 0

            return (
              <div key={dream.id} className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-100">
                <h2 className="text-xl font-semibold mb-2">{dream.title}</h2>
                <p className="text-gray-600 mb-4">{dream.description}</p>
                
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-purple-100 rounded-full text-sm">
                    {dream.category}
                  </span>
                  {dream.estimated_cost && (
                    <span className="px-3 py-1 bg-green-100 rounded-full text-sm">
                      💰 ${dream.estimated_cost}
                    </span>
                  )}
                </div>

                {mutual ? (
                  <div className="bg-green-100 p-3 rounded-lg text-center">
                    <span className="text-green-700 font-semibold">
                      💚 Mutual Dream!
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => handleSwipe(dream.id, false)}
                      className={`text-4xl opacity-50 hover:opacity-100 transition ${
                        userSwiped && !userSwiped.swiped_right ? 'opacity-100' : ''
                      }`}
                    >
                      👎
                    </button>
                    <button
                      onClick={() => handleSwipe(dream.id, true)}
                      className={`text-4xl opacity-50 hover:opacity-100 transition ${
                        userSwiped?.swiped_right ? 'opacity-100' : ''
                      }`}
                    >
                      ❤️
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}