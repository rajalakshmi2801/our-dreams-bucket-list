'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

// Separate component that uses useSearchParams
function VerifyContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      const email = searchParams.get('email')
      const token = searchParams.get('token')

      if (!email || !token) {
        setStatus('error')
        setMessage('Invalid verification link')
        return
      }

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, token })
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
          setTimeout(() => window.location.href = '/login?verified=true', 3000)
        } else {
          setStatus('error')
          setMessage(data.error)
        }
      } catch (error) {
        setStatus('error')
        setMessage('Verification failed')
      }
    }

    verify()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">Verifying your email...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-green-700 mb-2">Email Verified! 🎉</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-400">Redirecting to login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-red-700 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// Main page component with Suspense
export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}