'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DreamCard from '@/components/dreams/DreamCard';
import type { Dream } from '@/lib/types';
import OverlayLoader from '@/components/ui/OverlayLoader';

const POLL_INTERVAL = 10000;

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'creator' | 'fulfiller'>('creator');
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDreams = useCallback(async (mode: string) => {
    try {
      const res = await fetch(`/api/dreams/list?mode=${mode}`, { credentials: 'include' });
      const data = await res.json();
      setDreams(data.dreams || []);
    } catch (error) {
      console.error('Error fetching dreams:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();
        if (!data.user) { router.push('/auth/login'); return; }
        setUser(data.user);
        await fetchDreams('creator');
      } catch {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchDreams]);

  // Refetch when view mode changes
  useEffect(() => {
    if (!user) return;
    setActionLoading(true);
    setActiveTab('all');
    fetchDreams(viewMode).finally(() => setActionLoading(false));
  }, [viewMode, user, fetchDreams]);

  // Auto-poll
  useEffect(() => {
    if (!user) return;
    pollRef.current = setInterval(() => fetchDreams(viewMode), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user, viewMode, fetchDreams]);

  // Dream actions - all show overlay loader
  const handleActivateDream = async (dreamId: number) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/dreams/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamId, userId: user.id })
      });
      if (res.ok) await fetchDreams(viewMode);
    } catch (error) { console.error('Error:', error); }
    finally { setActionLoading(false); }
  };

  const handleRequestFulfillment = async (dreamId: number, notes: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/dreams/request-fulfillment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamId, userId: user.id, notes })
      });
      if (res.ok) await fetchDreams(viewMode);
    } catch (error) { console.error('Error:', error); }
    finally { setActionLoading(false); }
  };

  const handleVerifyFulfillment = async (dreamId: number, approved: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/dreams/verify-fulfillment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamId, userId: user.id, approved })
      });
      if (res.ok) await fetchDreams(viewMode);
    } catch (error) { console.error('Error:', error); }
    finally { setActionLoading(false); }
  };

  if (loading) {
    return <OverlayLoader />;
  }

  const pendingDreams = dreams.filter(d => d.status === 'pending');
  const activeDreams = dreams.filter(d => d.status === 'active');
  const requestedDreams = dreams.filter(d => d.status === 'fulfillment_requested');
  const completedDreams = dreams.filter(d => d.status === 'completed');

  const getTabContent = () => {
    switch (activeTab) {
      case 'pending': return pendingDreams;
      case 'active': return activeDreams;
      case 'requested': return requestedDreams;
      case 'completed': return completedDreams;
      default: return dreams;
    }
  };

  const isCreatorMode = viewMode === 'creator';

  return (
    <>
      {actionLoading && <OverlayLoader />}

      {/* View Mode Toggle */}
      <div className="bg-white rounded-2xl p-1 flex mb-5 border border-rose-100/50 shadow-sm">
        <button
          onClick={() => setViewMode('creator')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
            isCreatorMode
              ? 'bg-gradient-to-r from-rose-400 to-purple-400 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          My Dreams
        </button>
        <button
          onClick={() => setViewMode('fulfiller')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
            !isCreatorMode
              ? 'bg-gradient-to-r from-purple-400 to-fuchsia-400 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          Partner&apos;s Dreams
        </button>
      </div>

      {/* Creator Mode Content */}
      {isCreatorMode ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-100/50">
              <p className="text-xs text-rose-400 font-medium">My Dreams</p>
              <p className="text-2xl font-bold text-rose-600 mt-0.5">{dreams.length}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100/50">
              <p className="text-xs text-emerald-400 font-medium">Fulfilled</p>
              <p className="text-2xl font-bold text-emerald-600 mt-0.5">{completedDreams.length}</p>
            </div>
          </div>

          {/* Requests Alert */}
          {requestedDreams.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200/50 rounded-2xl p-4 mb-5">
              <p className="text-sm font-semibold text-purple-800">
                {requestedDreams.length} dream{requestedDreams.length > 1 ? 's' : ''} awaiting your review
              </p>
            </div>
          )}

          {/* Create Dream + Refresh */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => router.push('/dreams/create')}
              className="flex-1 bg-gradient-to-r from-rose-400 to-purple-400 text-white py-3.5 rounded-2xl font-medium shadow-sm hover:shadow-lg hover:shadow-rose-200 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Dream
            </button>
            <button
              onClick={() => { setActionLoading(true); fetchDreams(viewMode).finally(() => setActionLoading(false)); }}
              disabled={actionLoading}
              className="w-12 bg-white border border-rose-100 rounded-2xl flex items-center justify-center hover:bg-rose-50 transition disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Fulfiller Stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-3 text-center border border-amber-100/50">
              <p className="text-xl font-bold text-amber-600">{pendingDreams.length}</p>
              <p className="text-xs text-amber-400 font-medium">Available</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-3 text-center border border-emerald-100/50">
              <p className="text-xl font-bold text-emerald-600">{activeDreams.length}</p>
              <p className="text-xs text-emerald-400 font-medium">Active</p>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-3 text-center border border-rose-100/50">
              <p className="text-xl font-bold text-rose-600">{completedDreams.length}</p>
              <p className="text-xs text-rose-400 font-medium">Fulfilled</p>
            </div>
          </div>

          {/* Refresh */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setActionLoading(true); fetchDreams(viewMode).finally(() => setActionLoading(false)); }}
              disabled={actionLoading}
              className="text-sm text-rose-400 flex items-center gap-1 hover:text-rose-600 transition disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { id: 'all', label: 'All', count: dreams.length },
          { id: 'pending', label: 'Pending', count: pendingDreams.length },
          { id: 'active', label: 'Active', count: activeDreams.length },
          ...(isCreatorMode ? [{ id: 'requested', label: 'Requests', count: requestedDreams.length }] : []),
          { id: 'completed', label: 'Done', count: completedDreams.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-rose-400 to-purple-400 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-rose-200 hover:text-rose-500'
            }`}
          >
            {tab.label}{tab.count > 0 ? ` (${tab.count})` : ''}
          </button>
        ))}
      </div>

      {/* Dreams List */}
      {getTabContent().length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-gray-400 text-base">
            {isCreatorMode ? 'No dreams here yet' : 'No partner dreams to fulfill'}
          </p>
          {isCreatorMode && activeTab === 'all' && (
            <button
              onClick={() => router.push('/dreams/create')}
              className="mt-3 text-rose-500 font-medium text-sm hover:text-rose-600 transition"
            >
              Create your first dream
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {getTabContent().map(dream => (
            <DreamCard
              key={dream.id}
              dream={dream}
              role={isCreatorMode ? 'creator' : 'fulfiller'}
              onActivate={() => handleActivateDream(dream.id)}
              onRequestFulfillment={(notes) => handleRequestFulfillment(dream.id, notes)}
              onVerify={(approved) => handleVerifyFulfillment(dream.id, approved)}
            />
          ))}
        </div>
      )}
    </>
  );
}
