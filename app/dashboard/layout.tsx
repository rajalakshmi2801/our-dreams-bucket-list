'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import OverlayLoader from '@/components/ui/OverlayLoader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Always verify with server - single source of truth
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();

        if (!data.user) {
          localStorage.removeItem('user');
          sessionStorage.removeItem('session_active');
          router.push('/auth/login');
          return;
        }

        // Mark session as active
        sessionStorage.setItem('session_active', 'true');
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      } catch {
        localStorage.removeItem('user');
        sessionStorage.removeItem('session_active');
        router.push('/auth/login');
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Continue with client-side cleanup
    }
    localStorage.removeItem('user');
    sessionStorage.removeItem('session_active');
    router.push('/auth/login');
  };

  if (isChecking) {
    return <OverlayLoader />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/80 via-white to-purple-50/60 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-rose-100/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-purple-400 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-800">Our Dreams</h1>
              <p className="text-xs text-gray-400 -mt-0.5">{user.full_name}</p>
            </div>
          </div>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-rose-50 rounded-xl transition"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-4 top-14 bg-white rounded-xl shadow-xl border border-rose-100 w-52 py-2 z-20 animate-fade-in-up">
              <div className="px-4 py-3 border-b border-rose-50">
                <p className="text-sm font-medium text-gray-800">{user.full_name}</p>
                <p className="text-xs text-gray-400">@{user.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-rose-100/50 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto flex justify-around items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex flex-col items-center p-2 text-rose-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-0.5 font-medium">Home</span>
          </button>

          <button
            onClick={() => router.push('/dreams/create')}
            className="flex flex-col items-center p-2 text-gray-400 hover:text-rose-500 transition"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-purple-400 rounded-full flex items-center justify-center shadow-md -mt-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs mt-0.5 font-medium">Create</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex flex-col items-center p-2 text-gray-400 hover:text-rose-500 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs mt-0.5 font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
