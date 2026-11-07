/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlaceCategory } from '../types.ts';
import { Utensils, Landmark, Trees, Home, Camera } from 'lucide-react';

interface Props {
  category?: PlaceCategory;
  name?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'wide';
}

export const ImagePlaceholder: React.FC<Props> = ({
  category = 'Budaya',
  name = 'Sibu, Sarawak',
  className = '',
  aspectRatio = 'video',
}) => {
  const getCategoryTheme = () => {
    switch (category) {
      case 'Makanan':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-800/40',
          textColor: 'text-amber-800 dark:text-amber-200',
          accent: '#e8973a',
          Icon: Utensils,
          label: 'Makanan Tradisi Sibu',
        };
      case 'Alam':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-800/40',
          textColor: 'text-emerald-800 dark:text-emerald-200',
          accent: '#0e7c66',
          Icon: Trees,
          label: 'Keindahan Alam Semulajadi',
        };
      case 'Kampung':
        return {
          bg: 'bg-orange-50 dark:bg-orange-950/40',
          border: 'border-orange-200 dark:border-orange-800/40',
          textColor: 'text-orange-800 dark:text-orange-200',
          accent: '#c77822',
          Icon: Home,
          label: 'Warisan Kampung & Komuniti',
        };
      default:
        return {
          bg: 'bg-teal-50 dark:bg-teal-950/40',
          border: 'border-teal-200 dark:border-teal-800/40',
          textColor: 'text-teal-800 dark:text-teal-200',
          accent: '#0e7c66',
          Icon: Landmark,
          label: 'Warisan & Budaya Sibu',
        };
    }
  };

  const theme = getCategoryTheme();
  const IconComponent = theme.Icon;

  const ratioClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'wide'
      ? 'aspect-[21/9]'
      : 'aspect-[16/10]';

  return (
    <div
      className={`relative w-full ${ratioClass} ${theme.bg} ${theme.border} border rounded-2xl flex flex-col items-center justify-center p-6 text-center overflow-hidden select-none ${className}`}
    >
      {/* Subtle geometric pattern representing Sarawakian craft motifs */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 dark:opacity-5 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern id="sibu-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="20" cy="20" r="3" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#sibu-pattern)" />
      </svg>

      <div className="relative z-10 flex flex-col items-center max-w-xs">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-3"
          style={{ backgroundColor: `${theme.accent}20` }}
        >
          <IconComponent className="w-7 h-7" style={{ color: theme.accent }} />
        </div>
        <p className={`font-bold text-base line-clamp-1 ${theme.textColor}`}>
          {name}
        </p>
        <span className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1.5 font-medium">
          <Camera className="w-3.5 h-3.5" />
          {theme.label}
        </span>
        <span className="mt-2 text-[11px] px-2.5 py-0.5 rounded-full bg-white/70 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
          Sedia untuk gambar anda
        </span>
      </div>
    </div>
  );
};
