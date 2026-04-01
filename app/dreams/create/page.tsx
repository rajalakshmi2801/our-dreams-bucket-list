'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateDreamForm from '@/components/dreams/CreateDreamForm';
import OverlayLoader from '@/components/ui/OverlayLoader';

export default function CreateDreamPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();

        if (!data.user) {
          router.push('/auth/login');
          return;
        }

        setUser(data.user);
      } catch {
        router.push('/auth/login');
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  const handleCreateDream = async (dreamData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/dreams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dreamData,
          userId: user.id,
          coupleId: user.couple_id
        })
      });
      if (response.ok) {
        router.push('/dashboard');
        // Don't setLoading(false) - keep loader until navigation completes
        return;
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  if (!authChecked || !user) {
    return <OverlayLoader fullPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-purple-50">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Create New Dream</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-rose-100/30 border border-rose-100/30 p-6">
          {loading && <OverlayLoader />}
          <CreateDreamForm
            onSubmit={handleCreateDream}
            onCancel={() => router.back()}
          />
        </div>

        {/* Tips Card */}
        <div className="mt-6 bg-gradient-to-br from-rose-50 to-purple-50 rounded-2xl p-4 border border-rose-100/30">
          <h3 className="font-medium text-rose-700 mb-2">Dream Creation Tips</h3>
          <ul className="text-sm text-rose-600/80 space-y-2">
            <li className="flex items-start gap-2">
              <span>-</span>
              <span>Be specific about what you want</span>
            </li>
            <li className="flex items-start gap-2">
              <span>-</span>
              <span>Add a target date to stay motivated</span>
            </li>
            <li className="flex items-start gap-2">
              <span>-</span>
              <span>Set a realistic budget estimate</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
