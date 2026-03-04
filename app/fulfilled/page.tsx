'use client'

import { supabase } from '@/lib/supabase/client'
import { dreamOperations } from '@/lib/dreams'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DreamCard from '@/components/DreamCard'
import { ArrowLeft, Award, Clock } from 'lucide-react'

export default function FulfilledPage() {
  const router = useRouter()
  const [fulfilledDreams, setFulfilledDreams] = useState<any[]>([])
  const [requestedDreams, setRequestedDreams] = useState<any[]>([])
  const [userType, setUserType] = useState<'me' | 'partner' | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'fulfilled' | 'requested'>('fulfilled')

  useEffect(() => {
    fetchDreams()
  }, [])

  const fetchDreams = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    
    setUserType(user.user_metadata?.user_type || null)
    
    const allDreams = await dreamOperations.getDreams()
    setFulfilledDreams(allDreams.filter((d: any) => d.status === 'fulfilled'))
    setRequestedDreams(allDreams.filter((d: any) => d.status === 'fulfill_requested'))
    setLoading(false)
  }

  const handleApproveFulfill = async (dreamId: number) => {
    try {
      await dreamOperations.approveFulfillment(dreamId)
      fetchDreams()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleRejectFulfill = async (dreamId: number) => {
    await supabase
      .from('fulfill_requests')
      .update({ status: 'rejected' })
      .eq('dream_id', dreamId)
    
    fetchDreams()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
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
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Fulfilled Dreams
        </h1>
        <div className="w-10" />
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('fulfilled')}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'fulfilled'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Award className="inline w-4 h-4 mr-2" />
          Fulfilled
          <span className="ml-2 text-sm">({fulfilledDreams.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('requested')}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'requested'
              ? 'bg-yellow-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Clock className="inline w-4 h-4 mr-2" />
          Requests
          <span className="ml-2 text-sm">({requestedDreams.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'fulfilled' && (
        <div className="space-y-4">
          {fulfilledDreams.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-lg">No fulfilled dreams yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Keep working on your active dreams!
              </p>
            </div>
          ) : (
            fulfilledDreams.map((dream) => (
              <DreamCard
                key={dream.id}
                dream={dream}
                userType={userType}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'requested' && (
        <div className="space-y-4">
          {requestedDreams.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-lg">No pending requests</p>
            </div>
          ) : (
            requestedDreams.map((dream) => (
              <DreamCard
                key={dream.id}
                dream={dream}
                userType={userType}
                onApproveFulfill={() => handleApproveFulfill(dream.id)}
                onRejectFulfill={() => handleRejectFulfill(dream.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}