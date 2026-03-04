'use client'

import { supabase } from '@/lib/supabase/client'
import { dreamOperations } from '@/lib/dreams'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from '@/app/context/SessionContext'
import { ArrowLeft, Heart } from 'lucide-react'

export default function NewDream() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()
  const [loading, setLoading] = useState(false)
  const [dream, setDream] = useState({
    title: '',
    description: '',
    category: 'travel',
    estimated_date: '',
    estimated_cost: ''
  })

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push('/login')
    }
  }, [user, sessionLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await dreamOperations.createDream({
        title: dream.title,
        description: dream.description,
        category: dream.category,
        estimated_cost: dream.estimated_cost ? parseFloat(dream.estimated_cost) : null,
        estimated_date: dream.estimated_date || null
      })

      if (error) throw error
      
      router.push('/dashboard?tab=new')
      router.refresh() // Force refresh to show new dream
      
    } catch (error: any) {
      alert('Error adding dream: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => router.back()} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          New Dream ✨
        </h1>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          placeholder="Dream title"
          className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
          value={dream.title}
          onChange={(e) => setDream({...dream, title: e.target.value})}
          required
        />
        <textarea
          placeholder="Describe this dream..."
          className="w-full p-4 border border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-purple-500"
          value={dream.description}
          onChange={(e) => setDream({...dream, description: e.target.value})}
        />
        <select
          className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
          value={dream.category}
          onChange={(e) => setDream({...dream, category: e.target.value})}
        >
          <option value="travel">Travel ✈️</option>
          <option value="adventure">Adventure 🏔️</option>
          <option value="financial">Financial Goal 💰</option>
          <option value="learning">Learn Together 📚</option>
          <option value="home">Home & Family 🏠</option>
        </select>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            className="p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
            value={dream.estimated_date}
            onChange={(e) => setDream({...dream, estimated_date: e.target.value})}
          />
          <input
            type="number"
            placeholder="Est. cost $"
            className="p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
            value={dream.estimated_cost}
            onChange={(e) => setDream({...dream, estimated_cost: e.target.value})}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center"
        >
          <Heart className="w-5 h-5 mr-2" />
          {loading ? 'Adding Dream...' : 'Add to Our Dreams'}
        </button>
      </form>
    </div>
  )
}