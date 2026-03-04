'use client'

import { Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import { dreamOperations } from '@/lib/dreams'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from '@/app/context/SessionContext'
import TabNavigation from '@/components/TabNavigation'
import DreamCard from '@/components/DreamCard'
import { Heart, Sparkles, CheckCircle, Clock, User, LogOut } from 'lucide-react'

// Separate component that uses useSearchParams
function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'all'
  const { user, loading: sessionLoading, logout } = useSession()
  
  const [dreams, setDreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    new: 0,
    active: 0,
    requested: 0,
    fulfilled: 0
  })

  const fetchDreams = useCallback(async () => {
    if (!user) return
    
    try {
      const dreamsData = await dreamOperations.getDreams()
      setDreams(dreamsData)
      
      setStats({
        new: dreamsData.filter((d: any) => d.status === 'new').length,
        active: dreamsData.filter((d: any) => d.status === 'active').length,
        requested: dreamsData.filter((d: any) => d.status === 'fulfill_requested').length,
        fulfilled: dreamsData.filter((d: any) => d.status === 'fulfilled').length
      })
    } catch (error) {
      console.error('Error fetching dreams:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchDreams()
    }
  }, [user, sessionLoading, router, fetchDreams, currentTab])

  const handleActivate = async (dreamId: number) => {
    try {
      console.log('🔵 Activate clicked for dream:', dreamId)
      await dreamOperations.activateDream(dreamId)
      console.log('✅ Activate successful, refreshing dreams...')
      await fetchDreams()
    } catch (error: any) {
      console.error('❌ Activate error:', error)
      alert(error.message || 'Failed to activate dream')
    }
  }

  const handleRequestFulfill = async (dreamId: number) => {
    try {
      await dreamOperations.requestFulfillment(dreamId)
      fetchDreams()
    } catch (error: any) {
      alert(error.message)
    }
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

  const filteredDreams = dreams.filter(dream => {
    switch(currentTab) {
      case 'all': return true
      case 'new': return dream.status === 'new'
      case 'active': return dream.status === 'active'
      case 'fulfilled': return dream.status === 'fulfilled' || dream.status === 'fulfill_requested'
      default: return true
    }
  })

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Heart className="w-16 h-16 text-pink-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-500">Loading your dreams...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="pb-4">
      {/* Header with Logout */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {user.userType === 'me' ? 'Your Dashboard' : "Partner's Dashboard"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {user.userType === 'me' 
              ? 'You can approve fulfillment' 
              : 'You can activate dreams and request fulfillment'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm flex items-center ${
            user.userType === 'me' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'
          }`}>
            <User className="w-4 h-4 mr-1" />
            {user.userType === 'me' ? 'You' : 'Partner'}
          </div>
          <button
            onClick={logout}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-purple-50 p-3 rounded-xl text-center">
          <Sparkles className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500">New</p>
          <p className="text-lg font-bold text-purple-600">{stats.new}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-xl text-center">
          <Heart className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-lg font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-xl text-center">
          <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Request</p>
          <p className="text-lg font-bold text-yellow-600">{stats.requested}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl text-center">
          <CheckCircle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Done</p>
          <p className="text-lg font-bold text-blue-600">{stats.fulfilled}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Dreams List */}
      {filteredDreams.length === 0 ? (
  <div className="text-center py-12 bg-gray-50 rounded-2xl">
    <div className="text-6xl mb-4">✨</div>
    <p className="text-gray-400 text-lg">No dreams here yet</p>
    <p className="text-gray-400 text-sm mt-2">
      {currentTab === 'all' 
        ? user.userType === 'me' 
          ? 'Add your first dream!' 
          : 'Waiting for dreams to be added'
        : `No ${currentTab} dreams found`}
    </p>
    {currentTab === 'all' && user.userType === 'me' && (
      <button
        onClick={() => router.push('/dreams/new')}
        className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
      >
        Add New Dream
      </button>
    )}
  </div>
) : (
  filteredDreams.map((dream) => (
    <DreamCard
      key={dream.id}
      dream={dream}
      userType={user.userType}
      onActivate={() => handleActivate(dream.id)}
      onRequestFulfill={() => handleRequestFulfill(dream.id)}
      onApproveFulfill={() => handleApproveFulfill(dream.id)}
      onRejectFulfill={() => handleRejectFulfill(dream.id)}
    />
  ))
)}
    </div>
  )
}

// Main page component with Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Heart className="w-16 h-16 text-pink-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}