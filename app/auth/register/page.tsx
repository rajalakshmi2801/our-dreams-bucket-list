'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import RegistrationForm from '@/components/auth/RegistrationForm';
import OverlayLoader from '@/components/ui/OverlayLoader';

interface RegistrationFormData {
  creatorEmail: string;
  creatorName: string;
  creatorUsername: string;
  creatorPassword: string;
  creatorEmailVerified: boolean;
  fulfillerEmail: string;
  fulfillerName: string;
  fulfillerUsername: string;
  fulfillerPassword: string;
  fulfillerEmailVerified: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RegistrationFormData>({
    creatorEmail: '',
    creatorName: '',
    creatorUsername: '',
    creatorPassword: '',
    creatorEmailVerified: false,
    fulfillerEmail: '',
    fulfillerName: '',
    fulfillerUsername: '',
    fulfillerPassword: '',
    fulfillerEmailVerified: false
  });

  // Use ref to always have the latest form data (avoids stale closure in handleSubmit)
  const formDataRef = useRef(formData);

  const handleNext = (data: RegistrationFormData) => {
    formDataRef.current = data;
    setFormData(data);
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    // Read from ref to get the latest data (not stale state)
    const currentData = formDataRef.current;

    if (!currentData.fulfillerName || currentData.fulfillerName.trim() === '') {
      setError('Partner name is required');
      return;
    }

    if (!currentData.creatorName) {
      setError('Your name is required');
      return;
    }

    if (!currentData.creatorEmailVerified) {
      setError('Please verify your email first');
      return;
    }

    if (!currentData.fulfillerEmailVerified) {
      setError('Please verify partner email first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        creatorEmail: currentData.creatorEmail,
        creatorName: currentData.creatorName,
        creatorUsername: currentData.creatorUsername,
        creatorPassword: currentData.creatorPassword,
        fulfillerEmail: currentData.fulfillerEmail,
        fulfillerName: currentData.fulfillerName,
        fulfillerUsername: currentData.fulfillerUsername,
        fulfillerPassword: currentData.fulfillerPassword
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/auth/login?registered=true');
      } else {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-purple-50 flex items-center justify-center px-4 py-6 sm:py-12">
      {loading && <OverlayLoader />}

      <div className="w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-rose-100/50 border border-rose-100/30 p-6 sm:p-8">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex-1 text-center ${
                  i <= step ? 'text-rose-500' : 'text-gray-300'
                }`}
              >
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  i <= step ? 'bg-gradient-to-r from-rose-400 to-purple-400 text-white' : 'bg-gray-200'
                }`}>
                  {i}
                </div>
                <div className="text-xs sm:text-sm mt-1">
                  {i === 1 && 'Your Email'}
                  {i === 2 && 'Your Details'}
                  {i === 3 && "Partner's Email"}
                  {i === 4 && "Partner's Details"}
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6 animate-shake">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <RegistrationForm
            step={step}
            formData={formData}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
