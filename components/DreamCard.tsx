'use client'

import { formatDistanceToNow, format } from 'date-fns'
import { Heart, Sparkles, CheckCircle, Clock, User, Award, XCircle, Calendar } from 'lucide-react'

interface DreamCardProps {
  dream: any
  userType: 'me' | 'partner' | null
  onActivate?: () => void
  onRequestFulfill?: () => void
  onApproveFulfill?: () => void
  onRejectFulfill?: () => void
}

export default function DreamCard({ 
  dream, 
  userType, 
  onActivate, 
  onRequestFulfill, 
  onApproveFulfill,
  onRejectFulfill
}: DreamCardProps) {
  
  const getStatusBadge = () => {
    switch(dream.status) {
      case 'new':
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            New Dream
          </span>
        )
      case 'active':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
            <Heart className="w-3 h-3 mr-1" />
            Active {dream.activated_at && `• ${formatDistanceToNow(new Date(dream.activated_at), { addSuffix: true })}`}
          </span>
        )
      case 'fulfill_requested':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Fulfill Requested
          </span>
        )
      case 'fulfilled':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Fulfilled {dream.fulfilled_at && format(new Date(dream.fulfilled_at), 'MMM d, yyyy')}
          </span>
        )
    }
  }

  const getCategoryIcon = () => {
    switch(dream.category) {
      case 'travel': return '✈️'
      case 'adventure': return '🏔️'
      case 'financial': return '💰'
      case 'learning': return '📚'
      case 'home': return '🏠'
      default: return '✨'
    }
  }

  const getCategoryColor = () => {
    switch(dream.category) {
      case 'travel': return 'bg-blue-100 text-blue-700'
      case 'adventure': return 'bg-orange-100 text-orange-700'
      case 'financial': return 'bg-green-100 text-green-700'
      case 'learning': return 'bg-purple-100 text-purple-700'
      case 'home': return 'bg-pink-100 text-pink-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Format creation date
  const createdDate = dream.created_at ? format(new Date(dream.created_at), 'MMM d, yyyy') : 'Recently'

  return (
    <div className={`bg-white rounded-2xl shadow-md p-5 border-l-4 transition-all hover:shadow-lg ${
      dream.status === 'new' ? 'border-l-purple-500' :
      dream.status === 'active' ? 'border-l-green-500' :
      dream.status === 'fulfill_requested' ? 'border-l-yellow-500' :
      'border-l-blue-500'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{dream.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{dream.description}</p>
        </div>
        <div className="ml-3">
          {getStatusBadge()}
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-3 py-1 rounded-lg text-xs flex items-center ${getCategoryColor()}`}>
          <span className="mr-1">{getCategoryIcon()}</span>
          {dream.category.charAt(0).toUpperCase() + dream.category.slice(1)}
        </span>
        {dream.estimated_cost && (
          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium flex items-center">
            <span className="mr-1">💰</span>
            ${dream.estimated_cost}
          </span>
        )}
        {/* Show creation date instead of estimated date */}
        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          Created: {createdDate}
        </span>
        <span className={`px-3 py-1 rounded-lg text-xs flex items-center ${
          dream.created_by === 'rajalakshmi28012005@gmail.com' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'
        }`}>
          <User className="w-3 h-3 mr-1" />
          {dream.created_by === 'rajalakshmi28012005@gmail.com' ? 'You' : 'Partner'}
        </span>
      </div>

      {/* Action Buttons based on status and user type */}
      <div className="mt-4">
        {/* New Dreams - Only Partner can Activate */}
        {dream.status === 'new' && userType === 'partner' && (
          <button
            onClick={onActivate}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center"
          >
            <Heart className="w-5 h-5 mr-2" />
            Make it Active
          </button>
        )}

        {/* New Dreams - You see this but can't activate */}
        {dream.status === 'new' && userType === 'me' && (
          <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-medium text-center">
            Waiting for partner to activate
          </div>
        )}

        {/* Active Dreams - Only Partner can Request Fulfillment */}
        {dream.status === 'active' && userType === 'partner' && (
          <button
            onClick={onRequestFulfill}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Request Fulfillment
          </button>
        )}

        {/* Active Dreams - You see this but can't request (only approve later) */}
        {dream.status === 'active' && userType === 'me' && (
          <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-medium text-center">
            Partner will request fulfillment
          </div>
        )}

        {/* Fulfill Requested - Only You can Approve */}
        {dream.status === 'fulfill_requested' && userType === 'me' && (
          <div className="space-y-2">
            <div className="p-3 bg-yellow-50 rounded-xl text-sm text-yellow-800 flex items-center">
              <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Partner requested to fulfill this dream</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onApproveFulfill}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center"
              >
                <Award className="w-5 h-5 mr-2" />
                Approve
              </button>
              <button
                onClick={onRejectFulfill}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all flex items-center justify-center"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Not Yet
              </button>
            </div>
          </div>
        )}

        {/* Fulfill Requested - Partner sees waiting message */}
        {dream.status === 'fulfill_requested' && userType === 'partner' && (
          <div className="p-3 bg-yellow-50 rounded-xl text-center text-yellow-700">
            <Clock className="inline w-5 h-5 mr-2" />
            Waiting for approval
          </div>
        )}

        {/* Fulfilled - Both see this */}
        {dream.status === 'fulfilled' && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="w-6 h-6 text-yellow-500 mr-2" />
              <span className="font-semibold text-blue-700">Dream Fulfilled! 🎉</span>
            </div>
            <p className="text-xs text-gray-500">
              Completed on {dream.fulfilled_at && format(new Date(dream.fulfilled_at), 'MMMM d, yyyy')}
            </p>
          </div>
        )}
      </div>

      {/* Timestamps */}
      {(dream.activated_at || dream.fulfill_requested_at) && dream.status !== 'fulfilled' && (
        <div className="mt-3 text-xs text-gray-400 border-t pt-3">
          {dream.activated_at && (
            <p className="flex items-center">
              <Heart className="w-3 h-3 mr-1 text-green-500" />
              Activated {formatDistanceToNow(new Date(dream.activated_at), { addSuffix: true })}
            </p>
          )}
          {dream.fulfill_requested_at && (
            <p className="flex items-center mt-1">
              <Clock className="w-3 h-3 mr-1 text-yellow-500" />
              Fulfill requested {formatDistanceToNow(new Date(dream.fulfill_requested_at), { addSuffix: true })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}