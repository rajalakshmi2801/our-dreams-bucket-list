'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Tab {
  id: string
  label: string
  icon: string
}

const tabs: Tab[] = [
  { id: 'all', label: 'All Dreams', icon: '✨' },
  { id: 'new', label: 'New', icon: '🆕' },
  { id: 'active', label: 'Active', icon: '💚' },
  { id: 'fulfilled', label: 'Fulfilled', icon: '✅' },
]

export default function TabNavigation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'all'

  return (
    <div className="flex overflow-x-auto hide-scrollbar mb-6 -mx-4 px-4">
      <div className="flex space-x-2 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => router.push(`/dashboard?tab=${tab.id}`)}
            className={`px-6 py-3 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
              currentTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}