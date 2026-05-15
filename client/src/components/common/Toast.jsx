import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Toast = ({ type, message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
    error: <XCircleIcon className="h-5 w-5 text-red-400" />,
    info: <InformationCircleIcon className="h-5 w-5 text-blue-400" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />,
  };

  const bgColors = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    info: 'bg-blue-50',
    warning: 'bg-yellow-50',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 rounded-lg p-4 shadow-lg ${bgColors[type]} min-w-[300px] animate-slide-up`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className={`ml-3 text-sm font-medium ${textColors[type]}`}>{message}</div>
        <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
          <XCircleIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;