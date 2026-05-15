import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { isValidEmail } from '../../utils/validators';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    const result = await forgotPassword(email);
    
    setIsLoading(false);
    
    if (result.success) {
      setIsSubmitted(true);
    } else {
      setError(result.error || 'Failed to send reset link. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
          
          <p className="text-gray-600">
            We've sent a password reset link to <strong className="text-indigo-600">{email}</strong>
          </p>
          
          <p className="text-sm text-gray-500">
            Please check your inbox and follow the instructions to reset your password.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-yellow-800">
              💡 Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => setIsSubmitted(false)} 
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                try again
              </button>
            </p>
          </div>
          
          <Link 
            to="/login" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mt-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

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
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Forgot Password Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              🔐 We'll send a password reset link to your registered email address. 
              The link will expire in 1 hour for security reasons.
            </p>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </form>

        {/* Help Text */}
        <p className="text-center text-xs text-gray-500">
          Need help? <a href="/contact" className="text-indigo-600 hover:text-indigo-500">Contact Support</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;