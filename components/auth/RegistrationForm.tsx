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
};

export default function RegistrationForm({ step, formData = defaultFormData, onNext, onBack, onSubmit }: Props) {
  const [localData, setLocalData] = useState<RegistrationFormData>(formData);
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [currentOtpEmail, setCurrentOtpEmail] = useState('');
  const [otpType, setOtpType] = useState<'creator' | 'fulfiller'>('creator');
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);

  const isSendingOtp = useRef(false);
  const isVerifyingOtp = useRef(false);

  const generateUsername = (email: string): string => {
    if (!email) return '';
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const random = Math.floor(Math.random() * 1000);
    return `${base}${random}`;
  };

  const generatePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Sync with parent formData
  useEffect(() => {
    setLocalData(formData);
  }, [formData]);

  // Generate creator credentials when email is verified
  useEffect(() => {
    if (localData.creatorEmailVerified && !localData.creatorUsername && localData.creatorEmail) {
      const username = generateUsername(localData.creatorEmail);
      const password = generatePassword();
      
      const updatedData = {
        ...localData,
        creatorUsername: username,
        creatorPassword: password
      };
      setLocalData(updatedData);
    }
  }, [localData.creatorEmailVerified]);

  // Generate fulfiller credentials when email is verified
  useEffect(() => {
    if (localData.fulfillerEmailVerified && !localData.fulfillerUsername && localData.fulfillerEmail) {
      const username = generateUsername(localData.fulfillerEmail);
      const password = generatePassword();
      
      const updatedData = {
        ...localData,
        fulfillerUsername: username,
        fulfillerPassword: password
      };
      setLocalData(updatedData);
    }
  }, [localData.fulfillerEmailVerified]);

  const handleSendOtp = async (email: string, type: 'creator' | 'fulfiller') => {
    if (isSendingOtp.current) return;
    
    if (!email) {
      setOtpError('Please enter an email address');
      return;
    }

    isSendingOtp.current = true;
    setLoading(true);
    setShowFullScreenLoader(true);
    setOtpError('');
    setCurrentOtpEmail(email);
    setOtpType(type);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          type,
          creatorEmail: type === 'fulfiller' ? localData.creatorEmail : undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowOtp(true);
        setOtpError('');
      } else {
        setOtpError(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setOtpError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setShowFullScreenLoader(false);
      isSendingOtp.current = false;
    }
  };

  const handleVerifyOtp = async (email: string, otp: string, type: 'creator' | 'fulfiller') => {
    if (isVerifyingOtp.current) return;
    
    isVerifyingOtp.current = true;
    setLoading(true);
    setShowFullScreenLoader(true);
    setOtpError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (response.ok) {
        if (type === 'creator') {
          const updatedData = { ...localData, creatorEmailVerified: true };
          setLocalData(updatedData);
          setShowOtp(false);
          setOtpError('');
        } else {
          const updatedData = { ...localData, fulfillerEmailVerified: true };
          setLocalData(updatedData);
          setShowOtp(false);
          setOtpError('');
        }
      } else {
        setOtpError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setOtpError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
      setShowFullScreenLoader(false);
      isVerifyingOtp.current = false;
    }
  };

  const handleOtpClose = () => {
    setShowOtp(false);
    setOtpError('');
    isVerifyingOtp.current = false;
  };

  const handleNextClick = () => {
    // Only call onNext if we're not on the last step
    if (step < 4) {
      onNext(localData);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Email Verification</h2>
            
            {otpError && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 animate-shake">
                <p className="text-sm text-red-700 font-medium">{otpError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Email Address
              </label>
              <input
                type="email"
                value={localData.creatorEmail}
                onChange={(e) => {
                  const updated = { ...localData, creatorEmail: e.target.value };
                  setLocalData(updated);
                }}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="you@example.com"
                disabled={localData.creatorEmailVerified || loading}
              />
            </div>
            
            {!localData.creatorEmailVerified ? (
              <button
                onClick={() => handleSendOtp(localData.creatorEmail, 'creator')}
                disabled={loading || !localData.creatorEmail}
                className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Verification OTP'}
              </button>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg text-green-700 font-medium">
                ✓ Email Verified!
                {localData.creatorUsername && (
                  <div className="mt-3 text-sm bg-white p-3 rounded-lg">
                    <p className="font-semibold">Your Credentials:</p>
                    <p>Username: <strong className="text-pink-600">{localData.creatorUsername}</strong></p>
                    <p>Password: <strong className="text-pink-600">{localData.creatorPassword}</strong></p>
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
              className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 disabled:opacity-50 mt-4"
            >
              Next: Your Details
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Details</h2>
            
            <div className="bg-pink-50 rounded-xl p-6 border-2 border-pink-200">
              <h3 className="text-lg font-semibold text-pink-800 mb-4">❤️ Save These Credentials!</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-pink-700 mb-1">
                    Your Username
                  </label>
                  <input
                    type="text"
                    value={localData.creatorUsername || 'Generating...'}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pink-700 mb-1">
                    Your Password
                  </label>
                  <input
                    type="text"
                    value={localData.creatorPassword || 'Generating...'}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>
              
              <p className="text-sm text-pink-600 mt-4">
                💡 Save these credentials! You'll need them to login.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Full Name
              </label>
              <input
                type="text"
                value={localData.creatorName}
                onChange={(e) => {
                  const updated = { ...localData, creatorName: e.target.value };
                  setLocalData(updated);
                }}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 border border-pink-600 text-pink-600 py-3 rounded-lg hover:bg-pink-50"
              >
                Back
              </button>
              <button
                onClick={handleNextClick}
                disabled={!localData.creatorName}
                className="flex-1 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                Next: Partner's Email
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Partner's Email Verification</h2>
            
            {otpError && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 animate-shake">
                <p className="text-sm text-red-700 font-medium">{otpError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partner's Email Address
              </label>
              <input
                type="email"
                value={localData.fulfillerEmail}
                onChange={(e) => {
                  const updated = { ...localData, fulfillerEmail: e.target.value };
                  setLocalData(updated);
                }}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="partner@example.com"
                disabled={localData.fulfillerEmailVerified || loading}
              />
            </div>
            
            {!localData.fulfillerEmailVerified ? (
              <button
                onClick={() => handleSendOtp(localData.fulfillerEmail, 'fulfiller')}
                disabled={loading || !localData.fulfillerEmail}
                className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Verification OTP'}
              </button>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg text-green-700 font-medium">
                ✓ Partner's Email Verified!
                {localData.fulfillerUsername && (
                  <div className="mt-3 text-sm bg-white p-3 rounded-lg">
                    <p className="font-semibold">Partner's Credentials:</p>
                    <p>Username: <strong className="text-pink-600">{localData.fulfillerUsername}</strong></p>
                    <p>Password: <strong className="text-pink-600">{localData.fulfillerPassword}</strong></p>
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
              <button
                onClick={onBack}
                className="flex-1 border border-pink-600 text-pink-600 py-3 rounded-lg hover:bg-pink-50"
              >
                Back
              </button>
              <button
                onClick={handleNextClick}
                disabled={!localData.fulfillerEmailVerified}
                className="flex-1 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                Next: Partner's Details
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Partner's Details</h2>
            
            <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">❤️ Share These with Your Partner!</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">
                    Partner's Username
                  </label>
                  <input
                    type="text"
                    value={localData.fulfillerUsername || 'Generating...'}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">
                    Partner's Password
                  </label>
                  <input
                    type="text"
                    value={localData.fulfillerPassword || 'Generating...'}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>
              
              <p className="text-sm text-purple-600 mt-4">
                💡 Share these credentials with your partner. They'll need them to login.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partner's Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={localData.fulfillerName}
                onChange={(e) => {
                  const newName = e.target.value;
                  const updatedLocalData = {
                    ...localData,
                    fulfillerName: newName
                  };
                  setLocalData(updatedLocalData);
                  // Update parent immediately so the name is saved
                  onNext(updatedLocalData);
                }}
                className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="Jane Doe"
                required
              />
              {!localData.fulfillerName && (
                <p className="text-sm text-red-500 mt-1">Partner name is required</p>
              )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-700">
              <strong>Important:</strong> After registration, both you and your partner will receive an email with these credentials.
            </div>

            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 border border-pink-600 text-pink-600 py-3 rounded-lg hover:bg-pink-50"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!localData.fulfillerName || localData.fulfillerName.trim() === '') {
                    setOtpError('Partner name is required');
                    return;
                  }
                  // Update parent with final data, then submit
                  onNext(localData);
                  onSubmit();
                }}
                disabled={!localData.fulfillerName || localData.fulfillerName.trim() === ''}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
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
      {showFullScreenLoader && <OverlayLoader />}
      {renderStep()}
    </>
  );
}