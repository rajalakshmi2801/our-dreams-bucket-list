'use client'

import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface MutualDream {
  id: number
  progress_percentage: number
  dreams: {
    title: string
    description: string
    category: string
  }
  dream_progress: any[]
}

export default function MutualDreams() {
  const [mutualDreams, setMutualDreams] = useState<MutualDream[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMutualDreams()
  }, [])

  const fetchMutualDreams = async () => {
    const { data } = await supabase
      .from('mutual_dreams')
      .select(`
        *,
        dreams (*),
        dream_progress (*)
      `)
      .order('activated_at', { ascending: false })
    
    setMutualDreams(data || [])
    setLoading(false)
  }

  const updateProgress = async (mutualDreamId: number, progress: number) => {
    await supabase
      .from('mutual_dreams')
      .update({ progress_percentage: progress })
      .eq('id', mutualDreamId)
    
    fetchMutualDreams()
  }

  const addProgressUpdate = async (mutualDreamId: number, updateText: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase
      .from('dream_progress')
      .insert({
        mutual_dream_id: mutualDreamId,
        update_text: updateText,
        created_by: user?.id
      })
    
    fetchMutualDreams()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading active dreams...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-green-600">Active Dreams 💚</h1>
            <div className="space-x-4">
              <Link href="/dreams" className="text-gray-700 hover:text-purple-600">
                All Dreams
              </Link>
              <Link href="/mutual" className="text-gray-700 hover:text-green-600">
                Active Dreams
              </Link>
              <Link href="/dreams/new" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                + New Dream
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {mutualDreams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No active dreams yet.</p>
            <p className="text-gray-500 mt-2">Swipe right on each other's dreams to create active dreams!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {mutualDreams.map((md) => (
              <div key={md.id} className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
                <h2 className="text-2xl font-semibold mb-2">{md.dreams.title}</h2>
                <p className="text-gray-600 mb-4">{md.dreams.description}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span>Progress</span>
                    <span>{md.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-green-500 rounded-full h-4 transition-all"
                      style={{ width: `${md.progress_percentage}%` }}
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={md.progress_percentage}
                  onChange={(e) => updateProgress(md.id, parseInt(e.target.value))}
                  className="w-full mb-4"
                />

                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Progress Updates</h3>
                  {md.dream_progress?.map((update: any) => (
                    <div key={update.id} className="p-3 bg-purple-50 rounded-lg mb-2">
                      {update.update_text}
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      const update = prompt('Add a progress update:')
                      if (update) addProgressUpdate(md.id, update)
                    }}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-800"
                  >
                    + Add Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}