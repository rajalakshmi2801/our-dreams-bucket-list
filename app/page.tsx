import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-purple-50 overflow-hidden">
      {/* Floating decorative elements - hidden on very small screens */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden sm:block">
        <div className="absolute top-20 left-10 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
              Our Dreams
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/auth/login"
              className="text-rose-600 hover:text-rose-700 px-3 py-2 text-sm font-medium transition hidden sm:block"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-rose-500 to-purple-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-rose-200 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-16 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            For couples who dream together
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
            <span className="text-gray-800">Make Dreams</span>
            <br />
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Come True Together
            </span>
          </h2>

          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Create your shared bucket list, surprise your partner by fulfilling their dreams, and celebrate every moment together.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-rose-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-rose-200 transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Your Journey
            </Link>
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-rose-600 px-6 py-4 text-lg font-medium transition flex items-center gap-2"
            >
              Already a couple?
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center border border-rose-100 hover:shadow-lg hover:shadow-rose-100 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Create Dreams</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Add your wishes, travel goals, and bucket list items for your partner to see
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center border border-purple-100 hover:shadow-lg hover:shadow-purple-100 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Fulfill Dreams</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your partner works lovingly to make each dream a beautiful reality
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center border border-amber-100 hover:shadow-lg hover:shadow-amber-100 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Celebrate Together</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Share the joy when a dream is fulfilled and cherish every memory made
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-gray-400 text-sm">
          Made with love for dreamers everywhere
        </footer>
      </div>
    </div>
  );
}
