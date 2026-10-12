import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 5, totalReviews, interactive = false, onRate, size = 'sm' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const currentSize = sizeMap[size] || sizeMap.sm;

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= Math.round(rating);
        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <Star
              className={`${currentSize} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300'
              } transition-colors`}
            />
          </button>
        );
      })}
      {rating !== undefined && !interactive && (
        <span className="ml-1 text-xs font-bold text-slate-700">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {totalReviews !== undefined && (
        <span className="text-xs text-slate-400">({totalReviews})</span>
      )}
    </div>
  );
};

export default RatingStars;
