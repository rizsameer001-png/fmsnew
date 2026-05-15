import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { isValidPassword } from '../../utils/validators';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [token, setToken] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });

  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = '';

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) feedback = 'Weak password';
    else if (score <= 4) feedback = 'Medium password';
    else feedback = 'Strong password';

    return { score, feedback };
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
    if (errors.password) setErrors({ ...errors, password: '' });
    if (confirmPassword && value !== confirmPassword) {
      setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
    } else if (confirmPassword) {
      setErrors({ ...errors, confirmPassword: '' });
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (password !== value) {
      setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
    } else {
      setErrors({ ...errors, confirmPassword: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'Password must be at least 6 characters with one uppercase letter and one number';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(token, password);
    setIsLoading(false);

    if (result.success) {
      // Redirect is handled in auth context
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-red-500';
    if (passwordStrength.score <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
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
            Create New Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your new password below
          </p>
        </div>

        {/* Reset Password Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{passwordStrength.feedback}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use at least 6 characters with uppercase letters and numbers
                  </p>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              {confirmPassword && password === confirmPassword && password && (
                <p className="mt-1 text-xs text-green-500 flex items-center">
                  <CheckCircleIcon className="h-3 w-3 mr-1" /> Passwords match
                </p>
              )}
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
            <ul className="space-y-1 text-xs text-gray-600">
              <li className="flex items-center">
                {password.length >= 6 ? <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2" /> : <div className="h-3 w-3 mr-2" />}
                At least 6 characters
              </li>
              <li className="flex items-center">
                {/[A-Z]/.test(password) ? <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2" /> : <div className="h-3 w-3 mr-2" />}
                At least one uppercase letter
              </li>
              <li className="flex items-center">
                {/[0-9]/.test(password) ? <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2" /> : <div className="h-3 w-3 mr-2" />}
                At least one number
              </li>
            </ul>
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
                'Reset Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;