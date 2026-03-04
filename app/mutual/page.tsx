'use client'

import { supabase } from '@/lib/supabase/client'
import { dreamOperations } from '@/lib/dreams'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DreamCard from '@/components/DreamCard'
import { ArrowLeft, Heart } from 'lucide-react'

export default function MutualPage() {
  const router = useRouter()
  const [activeDreams, setActiveDreams] = useState<any[]>([])
  const [userType, setUserType] = useState<'me' | 'partner' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveDreams()
  }, [])

  const fetchActiveDreams = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    
    setUserType(user.user_metadata?.user_type || null)
    
    const dreamsData = await dreamOperations.getDreamsByStatus('active')
    setActiveDreams(dreamsData)
    setLoading(false)
  }

  const handleRequestFulfill = async (dreamId: number) => {
    try {
      await dreamOperations.requestFulfillment(dreamId)
      fetchActiveDreams()
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading active dreams...</p>
      </div>
    )
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => router.back()} 
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
          Active Dreams
        </h1>
        <div className="w-10" />
      </div>

      {/* Description */}
      <div className="bg-green-50 p-4 rounded-xl mb-6">
        <div className="flex items-center mb-2">
          <Heart className="w-5 h-5 text-green-600 mr-2" fill="currentColor" />
          <p className="font-semibold text-green-700">Dreams you both want</p>
        </div>
        <p className="text-sm text-green-600">
          {userType === 'partner' 
            ? 'You can request to fulfill these dreams' 
            : 'Partner can request to fulfill these dreams'}
        </p>
      </div>

      {/* Active Dreams List */}
      <div className="space-y-4">
        {activeDreams.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-lg">No active dreams yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Activate dreams from the dashboard to see them here
            </p>
          </div>
        ) : (
          activeDreams.map((dream) => (
            <DreamCard
              key={dream.id}
              dream={dream}
              userType={userType}
              onRequestFulfill={() => handleRequestFulfill(dream.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}