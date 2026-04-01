import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full mx-auto flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>

        <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent mb-3">404</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          This dream doesn&apos;t exist yet. Maybe it&apos;s waiting to be created?
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full bg-gradient-to-r from-rose-400 to-purple-400 text-white py-3 rounded-xl font-medium shadow-lg shadow-rose-200/50 hover:shadow-xl transition-all text-center"
          >
            Go Home
          </Link>
          <Link
            href="/auth/login"
            className="w-full border border-rose-200 text-rose-500 py-3 rounded-xl font-medium hover:bg-rose-50 transition text-center"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
