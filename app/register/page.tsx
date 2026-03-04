'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Eye, EyeOff, Mail, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react'

export default function Register() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  const [step, setStep] = useState(1)
  const [showPasswords, setShowPasswords] = useState({
    my: false,
    partner: false
  })
  
  const [formData, setFormData] = useState({
    email: '',
    myPassword: '',
    partnerPassword: '',
    myName: '',
    partnerName: ''
  })

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setMessage('')

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    // Check if there's a manual verification link
    if (data.verificationLink) {
      setMessage(`Account created! Click this link to verify: ${data.verificationLink}`)
      setMessageType('info')
    } else {
      setStep(2)
    }
    
  } catch (error: any) {
    setMessage(error.message)
    setMessageType('error')
  } finally {
    setLoading(false)
  }
}

  if (step === 2) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 mt-10">
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <Mail className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">Verify Your Email!</h1>
          <p className="text-gray-600">
            Verification link sent to <strong>{formData.email}</strong>
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-xl">
            <h3 className="font-semibold text-purple-700 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              One Email, One Verification
            </h3>
            <p className="text-sm text-purple-600">
              A single verification link has been sent to your shared email. 
              Click it to verify your email address.
            </p>
          </div>

          <div className="bg-pink-50 p-4 rounded-xl">
            <h3 className="font-semibold text-pink-700 mb-2">What happens next?</h3>
            <ul className="text-sm text-pink-600 list-disc pl-5 space-y-1">
              <li>Click the verification link in your email</li>
              <li>Your email will be verified for both accounts</li>
              <li>Both of you can then login with your own passwords</li>
              <li>The app will recognize who's logging in by which password you use</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl">
            <p className="text-sm text-yellow-700 flex items-center">
              <span className="mr-2">⚡</span>
              Check spam folder if you don't see the email. The link expires in 24 hours.
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/login')}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Go to Login
        </button>
      </div>
    </div>
  )
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 mt-2">
        <button onClick={() => router.back()} className="mb-4 p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <Heart className="w-16 h-16 text-pink-600 mx-auto mb-4" fill="currentColor" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create Couple Account
          </h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-2" />
              Shared Email
            </label>
            <input
              type="email"
              required
              className="w-full p-3 border rounded-xl"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="bg-purple-50 p-4 rounded-xl">
            <h3 className="font-semibold text-purple-700 mb-3">Your Account</h3>
            <input
              type="text"
              placeholder="Your name"
              className="w-full p-3 border rounded-xl mb-3"
              value={formData.myName}
              onChange={(e) => setFormData({...formData, myName: e.target.value})}
            />
            <div className="relative">
              <input
                type={showPasswords.my ? 'text' : 'password'}
                required
                placeholder="Your password"
                className="w-full p-3 border rounded-xl pr-10"
                value={formData.myPassword}
                onChange={(e) => setFormData({...formData, myPassword: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({...showPasswords, my: !showPasswords.my})}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPasswords.my ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="bg-pink-50 p-4 rounded-xl">
            <h3 className="font-semibold text-pink-700 mb-3">Partner's Account</h3>
            <input
              type="text"
              placeholder="Partner's name"
              className="w-full p-3 border rounded-xl mb-3"
              value={formData.partnerName}
              onChange={(e) => setFormData({...formData, partnerName: e.target.value})}
            />
            <div className="relative">
              <input
                type={showPasswords.partner ? 'text' : 'password'}
                required
                placeholder="Partner's password"
                className="w-full p-3 border rounded-xl pr-10"
                value={formData.partnerPassword}
                onChange={(e) => setFormData({...formData, partnerPassword: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({...showPasswords, partner: !showPasswords.partner})}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPasswords.partner ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm ${
              messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <AlertCircle className="inline w-4 h-4 mr-2" />
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Accounts'}
          </button>
        </form>
      </div>
    </div>
  )
}