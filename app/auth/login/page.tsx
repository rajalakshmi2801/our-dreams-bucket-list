'use client';

import { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import OverlayLoader from '@/components/ui/OverlayLoader';

export default function LoginPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();

        if (res.ok && data?.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          if (window.location.pathname !== '/dashboard') {
            window.location.href = '/dashboard';
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      const data = await res.json();

      if (res.ok && data.user) {
        sessionStorage.setItem('session_active', 'true');
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Invalid credentials');
        setLoading(false);
      }
    } catch {
      setError('Login failed. Try again.');
      setLoading(false);
    }
  };

  if (loading) return <OverlayLoader fullPage />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full sm:max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-1">Sign in to your dreams</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-rose-100/50 border border-rose-100/30 p-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 animate-shake">
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          )}
          <LoginForm onSubmit={handleLogin} loading={loading} />
        </div>
      </div>
    </div>
  );
}
