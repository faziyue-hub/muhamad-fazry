/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  rating: number; // 0 to 5
  maxStars?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<Props> = ({
  rating,
  maxStars = 5,
  interactive = false,
  onRatingChange,
  size = 'md',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizeClass = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-3.5 h-3.5';
      case 'lg':
        return 'w-6 h-6';
      case 'md':
      default:
        return 'w-4 h-4';
    }
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= activeRating;
        const isHalf = !isFilled && starValue - 0.5 <= activeRating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => {
              if (interactive && onRatingChange) {
                onRatingChange(starValue);
              }
            }}
            onMouseEnter={() => {
              if (interactive) setHoverRating(starValue);
            }}
            onMouseLeave={() => {
              if (interactive) setHoverRating(null);
            }}
            className={`transition-transform ${
              interactive
                ? 'cursor-pointer hover:scale-125 active:scale-95'
                : 'cursor-default pointer-events-none'
            }`}
            aria-label={`${starValue} bintang`}
          >
            <Star
              className={`${starSizeClass()} transition-colors ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : isHalf
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-stone-300 dark:text-stone-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
