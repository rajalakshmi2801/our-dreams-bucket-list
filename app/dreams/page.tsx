'use client'

import { supabase } from '@/lib/supabase/client'
import { dreamOperations } from '@/lib/dreams'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DreamCard from '@/components/DreamCard'
import { ArrowLeft, Filter } from 'lucide-react'

export default function DreamsPage() {
  const router = useRouter()
  const [dreams, setDreams] = useState<any[]>([])
  const [filteredDreams, setFilteredDreams] = useState<any[]>([])
  const [userType, setUserType] = useState<'me' | 'partner' | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showFilter, setShowFilter] = useState(false)

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
    
    const dreamsData = await dreamOperations.getDreams()
    setDreams(dreamsData)
    setFilteredDreams(dreamsData)
    setLoading(false)
  }

  const handleActivate = async (dreamId: number) => {
    try {
      await dreamOperations.activateDream(dreamId)
      fetchDreams()
    } catch (error: any) {
      alert(error.message)
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

  const applyFilter = (filterType: string) => {
    setFilter(filterType)
    if (filterType === 'all') {
      setFilteredDreams(dreams)
    } else {
      setFilteredDreams(dreams.filter(d => d.status === filterType))
    }
    setShowFilter(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dreams...</p>
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
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          All Dreams
        </h1>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className="p-2 hover:bg-gray-100 rounded-full relative"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Dropdown */}
      {showFilter && (
        <div className="absolute right-4 mt-2 bg-white rounded-xl shadow-lg border p-2 z-10">
          <button
            onClick={() => applyFilter('all')}
            className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
              filter === 'all' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
            }`}
          >
            All Dreams
          </button>
          <button
            onClick={() => applyFilter('new')}
            className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
              filter === 'new' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
            }`}
          >
            New Dreams
          </button>
          <button
            onClick={() => applyFilter('active')}
            className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
              filter === 'active' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
            }`}
          >
            Active Dreams
          </button>
          <button
            onClick={() => applyFilter('fulfill_requested')}
            className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
              filter === 'fulfill_requested' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
            }`}
          >
            Fulfill Requested
          </button>
          <button
            onClick={() => applyFilter('fulfilled')}
            className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
              filter === 'fulfilled' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
            }`}
          >
            Fulfilled
          </button>
        </div>
      )}

      {/* Filter Indicator */}
      {filter !== 'all' && (
        <div className="mb-4 p-2 bg-purple-50 rounded-lg text-sm text-purple-700">
          Showing: {filter} dreams
          <button 
            onClick={() => applyFilter('all')}
            className="ml-2 text-purple-900 font-semibold"
          >
            Clear
          </button>
        </div>
      )}

      {/* Dreams List */}
      <div className="space-y-4">
        {filteredDreams.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-400 text-lg">No dreams found</p>
          </div>
        ) : (
          filteredDreams.map((dream) => (
            <DreamCard
              key={dream.id}
              dream={dream}
              userType={userType}
              onActivate={() => handleActivate(dream.id)}
              onRequestFulfill={() => handleRequestFulfill(dream.id)}
              onApproveFulfill={() => handleApproveFulfill(dream.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}