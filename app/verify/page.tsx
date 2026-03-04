'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader, Heart } from 'lucide-react'

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
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
          setTimeout(() => router.push('/login?verified=true'), 3000)
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
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">Verifying your email...</h2>
            <p className="text-gray-500 mt-2">Please wait a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-green-700 mb-2">Email Verified! 🎉</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-purple-50 p-4 rounded-xl mb-4">
              <Heart className="w-6 h-6 text-pink-600 mx-auto mb-2" fill="currentColor" />
              <p className="text-sm text-gray-700">
                Both you and your partner can now login with your respective passwords.
              </p>
            </div>
            <p className="text-sm text-gray-400">Redirecting to login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-red-700 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}