'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full mx-auto flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Don&apos;t worry, even the best love stories have plot twists. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full bg-gradient-to-r from-rose-400 to-purple-400 text-white py-3 rounded-xl font-medium shadow-lg shadow-rose-200/50 hover:shadow-xl transition-all"
          >
            Try Again
          </button>
          <a
            href="/"
            className="w-full border border-rose-200 text-rose-500 py-3 rounded-xl font-medium hover:bg-rose-50 transition block"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
