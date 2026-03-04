'use client'
import { supabase } from '@/lib/supabase/client'  // FIXED: Added /client
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewDream() {
  const router = useRouter()
  const [dream, setDream] = useState({
    title: '',
    description: '',
    category: 'travel',
    estimated_date: '',
    estimated_cost: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Please login first')
      router.push('/login')
      return
    }
    
    const { error } = await supabase.from('dreams').insert({
      ...dream,
      created_by: user.id
    })

    if (error) {
      alert('Error adding dream: ' + error.message)
    } else {
      router.push('/dreams')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add a New Dream ✨</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Dream title"
          className="w-full p-3 border rounded-lg"
          value={dream.title}
          onChange={(e) => setDream({...dream, title: e.target.value})}
          required
        />
        <textarea
          placeholder="Describe this dream..."
          className="w-full p-3 border rounded-lg h-32"
          value={dream.description}
          onChange={(e) => setDream({...dream, description: e.target.value})}
        />
        <select
          className="w-full p-3 border rounded-lg"
          value={dream.category}
          onChange={(e) => setDream({...dream, category: e.target.value})}
        >
          <option value="travel">Travel ✈️</option>
          <option value="adventure">Adventure 🏔️</option>
          <option value="financial">Financial Goal 💰</option>
          <option value="learning">Learn Together 📚</option>
          <option value="home">Home & Family 🏠</option>
        </select>
        <input
          type="date"
          className="w-full p-3 border rounded-lg"
          value={dream.estimated_date}
          onChange={(e) => setDream({...dream, estimated_date: e.target.value})}
        />
        <input
          type="number"
          placeholder="Estimated cost ($)"
          className="w-full p-3 border rounded-lg"
          value={dream.estimated_cost}
          onChange={(e) => setDream({...dream, estimated_cost: e.target.value})}
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-lg hover:opacity-90"
        >
          Add to Our Dreams 💫
        </button>
      </form>
    </div>
  )
}