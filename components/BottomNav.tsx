'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from '@/app/context/SessionContext'
import { 
  LayoutGrid, 
  Heart, 
  CheckCircle, 
  Sparkles,
  PlusCircle
} from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const { user } = useSession() // Fixed: changed from 'userrace' to 'user'

  // Base navigation items that everyone sees
  const baseNavItems = [
    { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard', color: 'text-purple-600' },
    { href: '/dreams', icon: Sparkles, label: 'All Dreams', color: 'text-pink-600' },
    { href: '/mutual', icon: Heart, label: 'Active', color: 'text-red-600' },
    { href: '/fulfilled', icon: CheckCircle, label: 'Fulfilled', color: 'text-blue-600' },
  ]

  // Add button only for 'me' user type
  const navItems = user?.userType === 'me' 
    ? [
        ...baseNavItems.slice(0, 2), // Dashboard and All Dreams
        { href: '/dreams/new', icon: PlusCircle, label: 'Add', color: 'text-green-600' },
        ...baseNavItems.slice(2) // Active and Fulfilled
      ]
    : baseNavItems

  // Don't render if no user (prevents flash on login page)
  if (!user) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 shadow-lg rounded-t-2xl">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-all ${
                isActive ? item.color + ' scale-110' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} className={isActive ? 'fill-current' : ''} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}