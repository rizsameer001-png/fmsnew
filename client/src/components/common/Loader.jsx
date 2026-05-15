import React from 'react';

export const LoadingSpinner = ({ size = 'md', color = 'indigo' }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-b-2 border-${color}-600 ${sizes[size]}`}></div>
    </div>
  );
};

export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  if (type === 'card') {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
        <div className="p-4 border-b border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingSpinner;