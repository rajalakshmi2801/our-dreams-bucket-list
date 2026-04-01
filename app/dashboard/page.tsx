'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DreamCard from '@/components/dreams/DreamCard';
import type { Dream } from '@/lib/types';
import OverlayLoader from '@/components/ui/OverlayLoader';
import { DREAM_CATEGORIES } from '@/lib/categories';

const POLL_INTERVAL = 10000;

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'creator' | 'fulfiller'>('creator');
  const [showFilter, setShowFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState('all_time');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
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

  useEffect(() => {
    if (!user) return;
    setActionLoading(true);
    setActiveTab('all');
    setSearchQuery('');
    setCategoryFilter([]);
    setDateFilter('all_time');
    setCustomFrom('');
    setCustomTo('');
    setShowFilter(false);
    fetchDreams(viewMode).finally(() => setActionLoading(false));
  }, [viewMode, user, fetchDreams]);

  useEffect(() => {
    if (!user) return;
    pollRef.current = setInterval(() => fetchDreams(viewMode), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user, viewMode, fetchDreams]);

  const handleActivateDream = async (dreamId: number) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/dreams/activate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamId, userId: user.id, approved })
      });
      if (res.ok) await fetchDreams(viewMode);
    } catch (error) { console.error('Error:', error); }
    finally { setActionLoading(false); }
  };

  if (loading) return <OverlayLoader fullPage />;

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

  const filterByDate = (list: Dream[]) => {
    if (dateFilter === 'all_time') return list;
    if (dateFilter === 'custom') {
      const from = customFrom ? new Date(customFrom) : null;
      const to = customTo ? new Date(customTo + 'T23:59:59') : null;
      return list.filter(d => {
        const created = new Date(d.created_at);
        if (from && created < from) return false;
        if (to && created > to) return false;
        return true;
      });
    }
    const now = new Date();
    const start = new Date();
    if (dateFilter === 'today') start.setHours(0, 0, 0, 0);
    else if (dateFilter === 'week') start.setDate(now.getDate() - 7);
    else if (dateFilter === 'month') start.setMonth(now.getMonth() - 1);
    return list.filter(d => new Date(d.created_at) >= start);
  };

  const filterBySearch = (list: Dream[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(d =>
      d.title.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q)) ||
      (d.category && d.category.toLowerCase().includes(q))
    );
  };

  const filterByCategory = (list: Dream[]) => {
    if (categoryFilter.length === 0) return list;
    return list.filter(d => d.category && categoryFilter.includes(d.category));
  };

  const filteredDreams = filterBySearch(filterByCategory(filterByDate(getTabContent())));
  const isCreatorMode = viewMode === 'creator';
  const hasActiveFilters = dateFilter !== 'all_time' || searchQuery.trim() !== '' || categoryFilter.length > 0;

  const clearAllFilters = () => {
    setDateFilter('all_time');
    setCustomFrom('');
    setCustomTo('');
    setSearchQuery('');
    setCategoryFilter([]);
    setShowFilter(false);
  };

  return (
    <>
      {actionLoading && <OverlayLoader />}

      {/* View Mode Toggle */}
      <div className="bg-white rounded-2xl p-1 flex mb-4 border border-rose-100/50 shadow-sm">
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

      {/* Stats */}
      {isCreatorMode ? (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-100/50">
            <p className="text-xs text-rose-400 font-medium">My Dreams</p>
            <p className="text-2xl font-bold text-rose-600 mt-0.5">{dreams.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100/50">
            <p className="text-xs text-emerald-400 font-medium">Fulfilled</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{completedDreams.length}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 mb-4">
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
      )}

      {/* Requests Alert */}
      {isCreatorMode && requestedDreams.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200/50 rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-purple-800">
            {requestedDreams.length} dream{requestedDreams.length > 1 ? 's' : ''} awaiting your review
          </p>
        </div>
      )}

      {/* Create Dream (creator only) + Search + Filter */}
      {isCreatorMode && (
        <button
          onClick={() => router.push('/dreams/create')}
          className="w-full bg-gradient-to-r from-rose-400 to-purple-400 text-white py-3.5 rounded-2xl font-medium shadow-sm hover:shadow-lg hover:shadow-rose-200 transition-all flex items-center justify-center gap-2 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Dream
        </button>
      )}

      {/* Search + Filter Row */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <svg className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dreams..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-200 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`w-11 flex items-center justify-center rounded-xl border transition ${
            hasActiveFilters
              ? 'bg-rose-50 border-rose-300 text-rose-500'
              : 'bg-white border-gray-200 text-gray-400 hover:border-rose-200 hover:text-rose-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white border border-gray-200 rounded-2xl p-3 mb-4 animate-fade-in-up shadow-sm relative z-30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filters</p>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="text-xs text-rose-500 font-medium">Clear All</button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Date dropdown */}
            <div>
              <label className="block text-[11px] text-gray-400 font-medium mb-1">Date</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowDateDropdown(!showDateDropdown); setShowCatDropdown(false); }}
                  className={`w-full h-10 pl-3 pr-8 border rounded-xl text-sm bg-white text-left truncate ${showDateDropdown ? 'border-rose-300 ring-2 ring-rose-200' : 'border-gray-200'}`}
                >
                  {{ all_time: 'All Time', today: 'Today', week: 'Last 7 Days', month: 'Last 30 Days', custom: 'Custom Range' }[dateFilter]}
                </button>
                <svg className={`w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {showDateDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDateDropdown(false)} />
                    <div className="absolute left-0 right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                      {[
                        { id: 'all_time', label: 'All Time' },
                        { id: 'today', label: 'Today' },
                        { id: 'week', label: 'Last 7 Days' },
                        { id: 'month', label: 'Last 30 Days' },
                        { id: 'custom', label: 'Custom Range' },
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => { setDateFilter(f.id); setShowDateDropdown(false); if (f.id !== 'custom') { setCustomFrom(''); setCustomTo(''); } }}
                          className={`w-full px-3 py-2.5 text-left text-sm hover:bg-rose-50 transition ${dateFilter === f.id ? 'bg-rose-50 text-rose-600 font-medium' : 'text-gray-600'}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Category dropdown */}
            <div>
              <label className="block text-[11px] text-gray-400 font-medium mb-1">Category</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowCatDropdown(!showCatDropdown); setShowDateDropdown(false); }}
                  className={`w-full h-10 pl-3 pr-8 border rounded-xl text-sm bg-white text-left truncate ${showCatDropdown ? 'border-rose-300 ring-2 ring-rose-200' : 'border-gray-200'}`}
                >
                  {categoryFilter.length === 0
                    ? 'All Categories'
                    : categoryFilter.length === 1
                      ? `${DREAM_CATEGORIES.find(c => c.id === categoryFilter[0])?.emoji} ${DREAM_CATEGORIES.find(c => c.id === categoryFilter[0])?.label}`
                      : `${categoryFilter.length} selected`}
                </button>
                <svg className={`w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${showCatDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {showCatDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowCatDropdown(false)} />
                    <div className="absolute left-0 right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="max-h-[245px] overflow-y-auto scrollbar-hide overscroll-contain">
                        <button
                          type="button"
                          onClick={() => { setCategoryFilter([]); setShowCatDropdown(false); }}
                          className={`w-full px-3 py-2.5 text-left text-sm hover:bg-rose-50 transition ${categoryFilter.length === 0 ? 'bg-rose-50 text-rose-600 font-medium' : 'text-gray-600'}`}
                        >
                          All Categories
                        </button>
                        {DREAM_CATEGORIES.map(cat => {
                          const isSelected = categoryFilter.includes(cat.id);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setCategoryFilter(isSelected ? categoryFilter.filter(c => c !== cat.id) : [...categoryFilter, cat.id])}
                              className={`w-full px-3 py-2.5 text-left text-sm hover:bg-rose-50 transition flex items-center gap-2 ${isSelected ? 'bg-rose-50 text-rose-600 font-medium' : 'text-gray-600'}`}
                            >
                              <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-rose-500 border-rose-500' : 'border-gray-300'}`}>
                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </span>
                              <span>{cat.emoji}</span>
                              <span className="truncate">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Custom date range */}
          {dateFilter === 'custom' && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[11px] text-gray-400 font-medium mb-1">From</label>
                <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-200 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 font-medium mb-1">To</label>
                <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-200 focus:border-transparent" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active filter badge */}
      {hasActiveFilters && !showFilter && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {dateFilter !== 'all_time' && (
            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full text-xs font-medium border border-rose-200">
              {dateFilter === 'custom' ? `${customFrom || '...'} - ${customTo || '...'}` : dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'This Week' : 'This Month'}
              <button onClick={() => { setDateFilter('all_time'); setCustomFrom(''); setCustomTo(''); }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {categoryFilter.map(cid => {
            const cat = DREAM_CATEGORIES.find(c => c.id === cid);
            return cat ? (
              <span key={cid} className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-medium border border-amber-200">
                {cat.emoji} {cat.label}
                <button onClick={() => setCategoryFilter(categoryFilter.filter(c => c !== cid))}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ) : null;
          })}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full text-xs font-medium border border-purple-200">
              &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery('')}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
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
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-rose-400 to-purple-400 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-rose-200 hover:text-rose-500'
            }`}
          >
            {tab.label}{tab.count > 0 ? ` (${tab.count})` : ''}
          </button>
        ))}
      </div>

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-xs text-gray-400 mb-3">{filteredDreams.length} result{filteredDreams.length !== 1 ? 's' : ''} found</p>
      )}

      {/* Dreams List */}
      {filteredDreams.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-gray-400 text-base">
            {hasActiveFilters
              ? 'No dreams match your filters'
              : isCreatorMode ? 'No dreams here yet' : 'No partner dreams to fulfill'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="mt-3 text-rose-500 font-medium text-sm hover:text-rose-600 transition">
              Clear filters
            </button>
          )}
          {!hasActiveFilters && isCreatorMode && activeTab === 'all' && (
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
          {filteredDreams.map(dream => (
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
