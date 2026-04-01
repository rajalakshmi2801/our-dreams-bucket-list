'use client';

import { useState, useRef, useEffect } from 'react';
import OtpVerification from './OtpVerification';
import OverlayLoader from '../ui/OverlayLoader';

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

interface Props {
  step: number;
  formData: RegistrationFormData;
  onNext: (data: RegistrationFormData) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const defaultFormData: RegistrationFormData = {
  creatorEmail: '', creatorName: '', creatorUsername: '', creatorPassword: '', creatorEmailVerified: false,
  fulfillerEmail: '', fulfillerName: '', fulfillerUsername: '', fulfillerPassword: '', fulfillerEmailVerified: false
};

export default function RegistrationForm({ step, formData = defaultFormData, onNext, onBack, onSubmit }: Props) {
  const [localData, setLocalData] = useState<RegistrationFormData>(formData);
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [currentOtpEmail, setCurrentOtpEmail] = useState('');
  const [otpType, setOtpType] = useState<'creator' | 'fulfiller'>('creator');

  const isSendingOtp = useRef(false);

  const generateUsername = (email: string): string => {
    if (!email) return '';
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${base}${Math.floor(Math.random() * 1000)}`;
  };

  const generatePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let pw = '';
    for (let i = 0; i < 10; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
    return pw;
  };

  useEffect(() => { setLocalData(formData); }, [formData]);

  useEffect(() => {
    if (localData.creatorEmailVerified && !localData.creatorUsername && localData.creatorEmail) {
      setLocalData(d => ({ ...d, creatorUsername: generateUsername(d.creatorEmail), creatorPassword: generatePassword() }));
    }
  }, [localData.creatorEmailVerified]);

  useEffect(() => {
    if (localData.fulfillerEmailVerified && !localData.fulfillerUsername && localData.fulfillerEmail) {
      setLocalData(d => ({ ...d, fulfillerUsername: generateUsername(d.fulfillerEmail), fulfillerPassword: generatePassword() }));
    }
  }, [localData.fulfillerEmailVerified]);

  const handleSendOtp = async (email: string, type: 'creator' | 'fulfiller') => {
    if (isSendingOtp.current) return;
    if (!email) { setOtpError('Please enter an email address'); return; }

    isSendingOtp.current = true;
    setLoading(true);
    setOtpError('');
    setCurrentOtpEmail(email);
    setOtpType(type);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type, creatorEmail: type === 'fulfiller' ? localData.creatorEmail : undefined })
      });
      const data = await response.json();
      if (response.ok) {
        setShowOtp(true);
        setOtpError('');
      } else {
        setOtpError(data.error || 'Failed to send OTP');
      }
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setLoading(false);
      isSendingOtp.current = false;
    }
  };

  // This THROWS on failure so OtpVerification modal can catch and display the error
  const handleVerifyOtp = async (email: string, otp: string, type: 'creator' | 'fulfiller') => {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await response.json();

    if (!response.ok) {
      // Throw so the OTP modal catches this and shows the error
      throw new Error(data.error || 'Invalid or expired OTP');
    }

    // Success - update state and close modal
    if (type === 'creator') {
      setLocalData(d => ({ ...d, creatorEmailVerified: true }));
    } else {
      setLocalData(d => ({ ...d, fulfillerEmailVerified: true }));
    }
    setShowOtp(false);
    setOtpError('');
  };

  const handleOtpClose = () => {
    setShowOtp(false);
    setOtpError('');
  };

  const handleNextClick = () => {
    if (step < 4) onNext(localData);
  };

  // Error alert component
  const ErrorAlert = ({ message }: { message: string }) => (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 animate-shake">
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4 text-rose-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-rose-600 font-medium">{message}</p>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-800">Your Email Verification</h2>

            {otpError && <ErrorAlert message={otpError} />}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Your Email Address</label>
              <input
                type="email"
                value={localData.creatorEmail}
                onChange={(e) => setLocalData({ ...localData, creatorEmail: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                placeholder="you@example.com"
                disabled={localData.creatorEmailVerified || loading}
              />
            </div>

            {!localData.creatorEmailVerified ? (
              <button
                onClick={() => handleSendOtp(localData.creatorEmail, 'creator')}
                disabled={loading || !localData.creatorEmail}
                className="w-full bg-gradient-to-r from-rose-400 to-purple-400 text-white py-3 rounded-xl font-medium disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Sending...' : 'Send Verification OTP'}
              </button>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <p className="text-emerald-700 font-medium text-sm">Email Verified</p>
                {localData.creatorUsername && (
                  <div className="mt-3 text-sm bg-white p-3 rounded-lg border border-emerald-100">
                    <p className="font-semibold text-gray-700 mb-1">Your Credentials:</p>
                    <p className="text-gray-600">Username: <strong className="text-rose-500">{localData.creatorUsername}</strong></p>
                    <p className="text-gray-600">Password: <strong className="text-rose-500">{localData.creatorPassword}</strong></p>
                  </div>
                )}
              </div>
            )}

            {showOtp && (
              <OtpVerification
                email={currentOtpEmail}
                onVerify={(otp) => handleVerifyOtp(currentOtpEmail, otp, otpType)}
                onClose={handleOtpClose}
              />
            )}

            <button
              onClick={handleNextClick}
              disabled={!localData.creatorEmailVerified}
              className="w-full bg-gradient-to-r from-rose-400 to-purple-400 text-white py-3 rounded-xl font-medium disabled:opacity-50 shadow-sm"
            >
              Next: Your Details
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-800">Your Details</h2>

            <div className="bg-rose-50 rounded-xl p-5 border border-rose-200">
              <h3 className="text-base font-semibold text-rose-700 mb-3">Save These Credentials!</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-rose-600 mb-1">Your Username</label>
                  <input type="text" value={localData.creatorUsername || 'Generating...'} readOnly
                    className="w-full px-3 py-2.5 border border-rose-200 rounded-lg bg-white font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-rose-600 mb-1">Your Password</label>
                  <input type="text" value={localData.creatorPassword || 'Generating...'} readOnly
                    className="w-full px-3 py-2.5 border border-rose-200 rounded-lg bg-white font-mono text-sm" />
                </div>
              </div>
              <p className="text-xs text-rose-500 mt-3">Save these! You&apos;ll need them to login.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Your Full Name</label>
              <input
                type="text"
                value={localData.creatorName}
                onChange={(e) => setLocalData({ ...localData, creatorName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                placeholder="John Doe"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={onBack}
                className="flex-1 border border-rose-300 text-rose-500 py-3 rounded-xl hover:bg-rose-50 font-medium transition">
                Back
              </button>
              <button onClick={handleNextClick} disabled={!localData.creatorName}
                className="flex-1 bg-gradient-to-r from-rose-400 to-purple-400 text-white py-3 rounded-xl font-medium disabled:opacity-50 shadow-sm">
                Next: Partner&apos;s Email
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-800">Partner&apos;s Email Verification</h2>

            {otpError && <ErrorAlert message={otpError} />}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Partner&apos;s Email Address</label>
              <input
                type="email"
                value={localData.fulfillerEmail}
                onChange={(e) => setLocalData({ ...localData, fulfillerEmail: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                placeholder="partner@example.com"
                disabled={localData.fulfillerEmailVerified || loading}
              />
            </div>

            {!localData.fulfillerEmailVerified ? (
              <button
                onClick={() => handleSendOtp(localData.fulfillerEmail, 'fulfiller')}
                disabled={loading || !localData.fulfillerEmail}
                className="w-full bg-gradient-to-r from-rose-400 to-purple-400 text-white py-3 rounded-xl font-medium disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Sending...' : 'Send Verification OTP'}
              </button>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <p className="text-emerald-700 font-medium text-sm">Partner&apos;s Email Verified</p>
                {localData.fulfillerUsername && (
                  <div className="mt-3 text-sm bg-white p-3 rounded-lg border border-emerald-100">
                    <p className="font-semibold text-gray-700 mb-1">Partner&apos;s Credentials:</p>
                    <p className="text-gray-600">Username: <strong className="text-rose-500">{localData.fulfillerUsername}</strong></p>
                    <p className="text-gray-600">Password: <strong className="text-rose-500">{localData.fulfillerPassword}</strong></p>
                  </div>
                )}
              </div>
            )}

            {showOtp && (
              <OtpVerification
                email={currentOtpEmail}
                onVerify={(otp) => handleVerifyOtp(currentOtpEmail, otp, otpType)}
                onClose={handleOtpClose}
              />
            )}

            <div className="flex gap-3">
              <button onClick={onBack}
                className="flex-1 border border-rose-300 text-rose-500 py-3 rounded-xl hover:bg-rose-50 font-medium transition">
                Back
              </button>
              <button onClick={handleNextClick} disabled={!localData.fulfillerEmailVerified}
                className="flex-1 bg-gradient-to-r from-rose-400 to-purple-400 text-white py-3 rounded-xl font-medium disabled:opacity-50 shadow-sm">
                Next: Partner&apos;s Details
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-800">Partner&apos;s Details</h2>

            <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
              <h3 className="text-base font-semibold text-purple-700 mb-3">Share These with Your Partner!</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-purple-600 mb-1">Partner&apos;s Username</label>
                  <input type="text" value={localData.fulfillerUsername || 'Generating...'} readOnly
                    className="w-full px-3 py-2.5 border border-purple-200 rounded-lg bg-white font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-600 mb-1">Partner&apos;s Password</label>
                  <input type="text" value={localData.fulfillerPassword || 'Generating...'} readOnly
                    className="w-full px-3 py-2.5 border border-purple-200 rounded-lg bg-white font-mono text-sm" />
                </div>
              </div>
              <p className="text-xs text-purple-500 mt-3">Share these credentials with your partner.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Partner&apos;s Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={localData.fulfillerName}
                onChange={(e) => {
                  const updated = { ...localData, fulfillerName: e.target.value };
                  setLocalData(updated);
                  onNext(updated);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                placeholder="Jane Doe"
              />
              {!localData.fulfillerName && (
                <p className="text-xs text-rose-400 mt-1">Partner name is required</p>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
              <p className="text-xs text-amber-700">
                <strong>Note:</strong> After registration, both of you will receive an email with login credentials.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={onBack}
                className="flex-1 border border-rose-300 text-rose-500 py-3 rounded-xl hover:bg-rose-50 font-medium transition">
                Back
              </button>
              <button
                onClick={() => {
                  if (!localData.fulfillerName || localData.fulfillerName.trim() === '') {
                    setOtpError('Partner name is required');
                    return;
                  }
                  onNext(localData);
                  onSubmit();
                }}
                disabled={!localData.fulfillerName || localData.fulfillerName.trim() === ''}
                className="flex-1 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white py-3 rounded-xl font-medium disabled:opacity-50 shadow-sm"
              >
                Register Couple
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {loading && <OverlayLoader />}
      {renderStep()}
    </>
  );
}
