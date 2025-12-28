/**
 * Rating Component
 * Display and input star ratings
 */

import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

// Display-only rating stars
export const RatingStars = ({ rating, size = 'default', showValue = false }) => {
  const sizeClasses = {
    small: 14,
    default: 18,
    large: 24,
  };

  const iconSize = sizeClasses[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <FiStar
            key={`full-${i}`}
            size={iconSize}
            className="text-yellow-400 fill-yellow-400"
          />
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative" style={{ width: iconSize, height: iconSize }}>
            <FiStar
              size={iconSize}
              className="text-gray-300 absolute"
            />
            <div className="overflow-hidden absolute" style={{ width: iconSize / 2 }}>
              <FiStar
                size={iconSize}
                className="text-yellow-400 fill-yellow-400"
              />
            </div>
          </div>
        )}
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <FiStar
            key={`empty-${i}`}
            size={iconSize}
            className="text-gray-300"
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

// Interactive rating input
export const RatingInput = ({ 
  value, 
  onChange, 
  size = 'large',
  disabled = false,
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    small: 20,
    default: 28,
    large: 36,
  };

  const iconSize = sizeClasses[size];
  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => !disabled && setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          className={`transition-transform ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <FiStar
            size={iconSize}
            className={`transition-colors ${
              star <= displayValue
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-lg font-medium text-gray-700">
          {value}/5
        </span>
      )}
    </div>
  );
};

// Rating summary card
export const RatingSummary = ({ averageRating, totalRatings, breakdown }) => {
  const maxCount = Math.max(...Object.values(breakdown || {}), 1);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800">
            {averageRating?.toFixed(1) || '0.0'}
          </div>
          <RatingStars rating={averageRating || 0} />
          <div className="text-sm text-gray-500 mt-1">
            {totalRatings || 0} {totalRatings === 1 ? 'review' : 'reviews'}
          </div>
        </div>
        
        {breakdown && Object.keys(breakdown).length > 0 && (
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3">{star}</span>
                <FiStar size={12} className="text-yellow-400 fill-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full rounded-full transition-all"
                    style={{
                      width: `${((breakdown[star] || 0) / maxCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-gray-500">{breakdown[star] || 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingStars;
