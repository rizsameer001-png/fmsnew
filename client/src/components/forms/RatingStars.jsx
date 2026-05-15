import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const RatingStars = ({ 
  value = 0, 
  onChange, 
  size = 'md', 
  readOnly = false,
  label,
  maxStars = 5 
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const handleClick = (rating) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (!readOnly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || value;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center space-x-1">
        {[...Array(maxStars)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(ratingValue)}
              onMouseEnter={() => handleMouseEnter(ratingValue)}
              onMouseLeave={handleMouseLeave}
              disabled={readOnly}
              className={`focus:outline-none transition-transform ${!readOnly ? 'hover:scale-110' : ''}`}
            >
              {ratingValue <= displayValue ? (
                <StarIcon className={`${sizes[size]} text-yellow-400`} />
              ) : (
                <StarOutlineIcon className={`${sizes[size]} text-gray-300 dark:text-gray-600`} />
              )}
            </button>
          );
        })}
        {value > 0 && (
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            ({value} / {maxStars})
          </span>
        )}
      </div>
    </div>
  );
};

export default RatingStars;