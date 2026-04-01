'use client';

import { useState } from 'react';
import type { Dream } from '@/lib/types';
import FulfillmentRequestModal from './FulfillmentRequestModal';

interface Props {
  dream: Dream;
  role: 'creator' | 'fulfiller';
  onActivate?: () => void;
  onRequestFulfillment?: (notes: string) => void;
  onVerify?: (approved: boolean) => void;
}

const statusConfig = {
  pending: {
    gradient: 'from-amber-50 to-orange-50',
    border: 'border-amber-200/60',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Pending',
    accent: 'text-amber-600',
  },
  active: {
    gradient: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200/60',
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'Active',
    accent: 'text-emerald-600',
  },
  fulfillment_requested: {
    gradient: 'from-purple-50 to-fuchsia-50',
    border: 'border-purple-200/60',
    badge: 'bg-purple-100 text-purple-700',
    label: 'Review Needed',
    accent: 'text-purple-600',
  },
  completed: {
    gradient: 'from-rose-50 to-pink-50',
    border: 'border-rose-200/60',
    badge: 'bg-rose-100 text-rose-700',
    label: 'Completed',
    accent: 'text-rose-600',
  },
};

export default function DreamCard({ dream, role, onActivate, onRequestFulfillment, onVerify }: Props) {
  const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const config = statusConfig[dream.status] || statusConfig.pending;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return null;
    }
  };

  return (
    <>
      <div className={`bg-gradient-to-br ${config.gradient} rounded-2xl border ${config.border} overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-800 leading-snug">{dream.title}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`${config.badge} px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                  {config.label}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(dream.created_at)}
                </span>
              </div>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 hover:bg-white/60 rounded-lg transition"
            >
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Preview Description */}
          {dream.description && !expanded && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{dream.description}</p>
          )}

          {/* Expanded Content */}
          {expanded && (
            <div className="space-y-3 mb-3 animate-fade-in-up">
              {dream.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{dream.description}</p>
              )}

              <div className="grid grid-cols-2 gap-2">
                {dream.category && (
                  <div className="bg-white/70 rounded-xl p-2.5">
                    <p className="text-xs text-gray-400">Category</p>
                    <p className="text-sm font-medium text-gray-700 capitalize">{dream.category}</p>
                  </div>
                )}

                {dream.estimated_cost && (
                  <div className="bg-white/70 rounded-xl p-2.5">
                    <p className="text-xs text-gray-400">Budget</p>
                    <p className={`text-sm font-semibold ${config.accent}`}>
                      ₹{Number(dream.estimated_cost).toLocaleString()}
                    </p>
                  </div>
                )}

                {dream.estimated_date && (
                  <div className="bg-white/70 rounded-xl p-2.5 col-span-2">
                    <p className="text-xs text-gray-400">Target Date</p>
                    <p className="text-sm font-medium text-gray-700">{formatDate(dream.estimated_date)}</p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-2 font-medium">Timeline</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-700 font-medium">{formatDate(dream.created_at)}</span>
                  </div>
                  {dream.activated_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Started</span>
                      <span className="text-emerald-600 font-medium">{formatDate(dream.activated_at)}</span>
                    </div>
                  )}
                  {dream.completed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fulfilled</span>
                      <span className="text-rose-600 font-medium">{formatDate(dream.completed_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-2">
            {role === 'fulfiller' && dream.status === 'pending' && onActivate && (
              <button
                onClick={onActivate}
                className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white py-2.5 rounded-xl font-medium text-sm shadow-sm hover:shadow-md transition-all"
              >
                Start Fulfilling
              </button>
            )}

            {role === 'fulfiller' && dream.status === 'active' && onRequestFulfillment && (
              <button
                onClick={() => setShowFulfillmentModal(true)}
                className="w-full bg-gradient-to-r from-purple-400 to-fuchsia-500 text-white py-2.5 rounded-xl font-medium text-sm shadow-sm hover:shadow-md transition-all"
              >
                Request Fulfillment
              </button>
            )}

            {role === 'creator' && dream.status === 'fulfillment_requested' && onVerify && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onVerify(true)}
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white py-2.5 rounded-xl font-medium text-sm shadow-sm hover:shadow-md transition-all"
                >
                  Confirm
                </button>
                <button
                  onClick={() => onVerify(false)}
                  className="bg-white text-rose-500 border border-rose-200 py-2.5 rounded-xl font-medium text-sm hover:bg-rose-50 transition-all"
                >
                  Reject
                </button>
              </div>
            )}

            {dream.status === 'completed' && (
              <div className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 py-2.5 rounded-xl text-center text-sm font-medium">
                Dream Achieved
              </div>
            )}
          </div>
        </div>
      </div>

      {showFulfillmentModal && onRequestFulfillment && (
        <FulfillmentRequestModal
          dreamTitle={dream.title}
          onSubmit={(notes) => {
            onRequestFulfillment(notes);
            setShowFulfillmentModal(false);
          }}
          onClose={() => setShowFulfillmentModal(false)}
        />
      )}
    </>
  );
}
