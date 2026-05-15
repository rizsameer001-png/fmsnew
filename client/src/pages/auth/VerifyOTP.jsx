import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const pastedArray = pastedData.split('');
    
    const newOtp = [...otp];
    for (let i = 0; i < pastedArray.length && i < 6; i++) {
      if (!isNaN(pastedArray[i])) {
        newOtp[i] = pastedArray[i];
      }
    }
    setOtp(newOtp);
    
    // Focus last filled input
    const lastFilledIndex = Math.min(pastedArray.length - 1, 5);
    if (lastFilledIndex >= 0 && lastFilledIndex < 5) {
      inputRefs.current[lastFilledIndex + 1]?.focus();
    } else if (lastFilledIndex === 5) {
      inputRefs.current[5]?.blur();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    const result = await verifyOTP(email, otpCode);
    
    setIsLoading(false);
    
    if (!result.success) {
      setError(result.error || 'Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    // Call resend OTP API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    setTimeLeft(300);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0].focus();
    
    // Show success message
    setError('');
    // You can add a toast notification here
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">FMS</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-sm font-medium text-gray-900">{email}</p>
        </div>

        {/* OTP Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 text-center mb-4">
              Enter Verification Code
            </label>
            <div className="flex justify-center gap-2 sm:gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
          </div>

          {/* Timer and Resend */}
          <div className="text-center">
            {!canResend ? (
              <p className="text-sm text-gray-600">
                Code expires in{' '}
                <span className="font-medium text-indigo-600">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Resend Verification Code
              </button>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </div>

          {/* Back to Register */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Registration
            </button>
          </div>
        </form>

        {/* Help Text */}
        <p className="text-center text-xs text-gray-500">
          Didn't receive the code? Check your spam folder or contact support
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;