'use client';

import { useState, useRef, useEffect } from 'react';
import OverlayLoader from '../ui/OverlayLoader';

interface Props {
  email: string;
  onVerify: (otp: string) => Promise<void>;
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
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
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
      digits.forEach((digit, i) => { if (i < 6) newOtp[i] = digit; });
      setOtp(newOtp);
      const next = newOtp.findIndex(d => d === '');
      inputRefs.current[next !== -1 ? next : 5]?.focus();
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
      await onVerify(otpString);
      // If onVerify doesn't throw, verification succeeded - modal will be closed by parent
    } catch (err: unknown) {
      // onVerify threw an error - show it in the modal
      const message = err instanceof Error ? err.message : 'Invalid or expired OTP. Please try again.';
      setError(message);
      // Clear OTP inputs so user can retry
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (response.ok) {
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setResendLoading(false);
      isResending.current = false;
    }
  };

  return (
    <>
      {loading && <OverlayLoader />}

      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Enter Verification Code</h3>
            <p className="text-gray-400 text-sm mt-1 break-all">
              Code sent to <strong className="text-gray-600">{email}</strong>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 animate-shake">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-rose-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-rose-600 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* OTP Inputs */}
          <div className="flex gap-2 justify-center mb-5" onPaste={handlePaste}>
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
                className={`w-11 h-12 text-center text-xl font-semibold border-2 rounded-xl focus:outline-none transition-colors ${
                  error
                    ? 'border-rose-300 bg-rose-50/50'
                    : digit
                      ? 'border-rose-400 bg-rose-50/30'
                      : 'border-gray-200 focus:border-rose-400'
                }`}
                disabled={loading}
              />
            ))}
          </div>

          {/* Timer / Resend */}
          <div className="text-center mb-5">
            {timer > 0 ? (
              <p className="text-gray-400 text-sm">
                Resend in <span className="font-semibold text-gray-600">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-rose-500 hover:text-rose-600 font-medium text-sm disabled:opacity-50 transition"
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-gray-200 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={otp.join('').length !== 6 || loading}
              className="flex-1 bg-gradient-to-r from-rose-400 to-purple-400 text-white py-2.5 rounded-xl font-medium shadow-sm hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
