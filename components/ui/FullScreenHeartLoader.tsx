'use client';

import { useEffect, useState } from 'react';

export default function FullScreenHeartLoader() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScale(prev => prev === 1 ? 1.2 : 1);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-rose-50/95 via-white/95 to-purple-50/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="relative">
        <div
          className="text-rose-400 transition-transform duration-700 ease-in-out"
          style={{ transform: `scale(${scale})` }}
        >
          <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="absolute -top-3 -right-3 animate-bounce">
          <svg className="w-5 h-5 text-rose-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="absolute -bottom-1 -left-2 animate-ping opacity-60">
          <svg className="w-3 h-3 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="mt-5 flex gap-1.5">
        <div className="w-2 h-2 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
        <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  );
}
