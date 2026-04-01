'use client';

export default function OverlayLoader() {
  return (
    <div className="fixed inset-0 bg-black/15 backdrop-blur-[3px] z-50 flex items-center justify-center">
      <div className="bg-white/95 rounded-2xl px-8 py-6 shadow-xl flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-11 h-11 rounded-full" style={{ border: '3px solid #ffe4e6' }} />
          <div className="w-11 h-11 rounded-full animate-spin absolute top-0 left-0" style={{ border: '3px solid transparent', borderTopColor: '#fb7185' }} />
          <svg className="w-5 h-5 text-rose-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
          <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    </div>
  );
}
