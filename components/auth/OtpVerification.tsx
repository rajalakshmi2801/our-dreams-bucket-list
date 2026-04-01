'use client';

import { useState, useRef, useEffect } from 'react';
import OverlayLoader from '../ui/OverlayLoader';

interface Props {
  email: string;
  onVerify: (otp: string) => void;
  onClose: () => void;
}

export default function OtpVerification({ email, onVerify, onClose }: Props) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isSubmitting = useRef(false);
  const isResending = useRef(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);
      
      const nextEmptyIndex = newOtp.findIndex(d => d === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting.current || loading) return;
    
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    isSubmitting.current = true;
    setLoading(true);
    setError('');
    
    try {
      console.log('Submitting OTP for verification:', otpString);
      await onVerify(otpString);
    } catch (error) {
      console.error('Verification error in component:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const handleResend = async () => {
    if (isResending.current || resendLoading) return;
    
    isResending.current = true;
    setResendLoading(true);
    setError('');
    
    try {
      console.log('Resending OTP to:', email);
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        setError('');
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setResendLoading(false);
      isResending.current = false;
    }
  };

  return (
    <>
      {loading && <OverlayLoader />}
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full mx-auto">
          <h3 className="text-xl font-bold mb-2">Enter Verification Code</h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base break-all">
            We've sent a 6-digit code to <strong>{email}</strong>
          </p>

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

          <div 
            className="flex gap-1 sm:gap-2 justify-center mb-6"
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-xl border-2 rounded-lg focus:border-pink-500 focus:outline-none ${
                  error ? 'border-red-500 animate-pulse' : 'border-gray-300'
                }`}
                disabled={loading}
              />
            ))}
          </div>

          <div className="text-center mb-6">
            {timer > 0 ? (
              <p className="text-gray-500 text-sm sm:text-base">
                Resend code in <span className="font-semibold">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-pink-600 hover:text-pink-700 font-medium text-sm sm:text-base disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full sm:flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={otp.join('').length !== 6 || loading}
              className="w-full sm:flex-1 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition disabled:opacity-50 font-medium"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}