'use client';

import { useEffect, useState } from 'react';
import LoveLoader from './LoveLoader';

export default function GlobalLoveLoader() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for fetch start
    const handleFetchStart = () => setLoading(true);
    const handleFetchEnd = () => setLoading(false);

    window.addEventListener('api-call-start', handleFetchStart);
    window.addEventListener('api-call-end', handleFetchEnd);

    return () => {
      window.removeEventListener('api-call-start', handleFetchStart);
      window.removeEventListener('api-call-end', handleFetchEnd);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div className="h-full bg-pink-500 animate-progress"></div>
    </div>
  );
}