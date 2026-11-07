/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlaceLocation, PlaceCategory, Language, UserCustomPhotos, DietaryOption } from '../types.ts';
import { TRANSLATIONS } from '../utils/translations.ts';
import { calculatePlaceRatingSummary } from '../utils/reviewsManager.ts';
import { ImagePlaceholder } from './ImagePlaceholder.tsx';
import {
  Search,
  Star,
  Clock,
  Plus,
  Trash2,
  Filter,
  Camera,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  Utensils,
  Sparkles,
} from 'lucide-react';

interface Props {
  places: PlaceLocation[];
  language: Language;
  onSelectPlace: (place: PlaceLocation) => void;
  favoriteIds: string[];
  onToggleFavorite: (placeId: string) => void;
  routePlaceIds: string[];
  onToggleRoute: (placeId: string) => void;
  customPhotos: UserCustomPhotos;
}

export const GalleryTab: React.FC<Props> = ({
  places,
  language,
  onSelectPlace,
  favoriteIds,
  onToggleFavorite,
  routePlaceIds,
  onToggleRoute,
  customPhotos,
}) => {
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'Semua'>('Semua');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryOption>('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortByRating, setSortByRating] = useState(false);

  const categories: (PlaceCategory | 'Semua')[] = ['Semua', 'Makanan', 'Budaya', 'Alam', 'Kampung'];

  const filteredPlaces = places
    .filter((p) => {
      const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchesFav = !onlyFavorites || favoriteIds.includes(p.id);

      // Dietary filter
      let matchesDietary = true;
      if (dietaryFilter === 'Halal') {
        matchesDietary = p.halalStatus === 'Halal';
      } else if (dietaryFilter === 'Muslim-Friendly') {
        matchesDietary = p.halalStatus === 'Halal' || p.halalStatus === 'Muslim-Friendly' || p.halalStatus === 'Vegetarian';
      } else if (dietaryFilter === 'Vegetarian') {
        matchesDietary = !!(p.isVegetarian || p.halalStatus === 'Vegetarian');
      } else if (dietaryFilter === 'Non-Halal') {
        matchesDietary = p.halalStatus === 'Non-Halal';
      }

      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory && matchesFav && matchesDietary;

      const matchesName = p.name.toLowerCase().includes(query);
      const matchesDesc =
        p.descriptionBM.toLowerCase().includes(query) ||
        p.descriptionEN.toLowerCase().includes(query);

      return matchesCategory && matchesFav && matchesDietary && (matchesName || matchesDesc);
    })
    .sort((a, b) => {
      if (sortByRating) {
        const ratingA = calculatePlaceRatingSummary(a.id).averageRating;
        const ratingB = calculatePlaceRatingSummary(b.id).averageRating;
        return ratingB - ratingA;
      }
      return 0;
    });

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 pt-3">
      {/* Header Info */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
          {t.galleryTitle}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          {t.gallerySubtitle}
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
          <Search className="w-4 h-4 text-[#0e7c66]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-stone-800/90 text-stone-900 dark:text-white rounded-2xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0e7c66] text-sm shadow-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
          >
            Padam
          </button>
        )}
      </div>

      {/* Filter Chips Bar (Category + Favorites Toggle) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-[#0e7c66] text-white shadow-sm'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
              >
                {cat === 'Semua' ? t.catAll : cat}
              </button>
            );
          })}
        </div>

        {/* Actions (Rating Sort + Favorites Toggle) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Highest Rated filter button */}
          <button
            onClick={() => setSortByRating(!sortByRating)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
              sortByRating
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${sortByRating ? 'fill-white text-white' : 'fill-amber-400 text-amber-500'}`} />
            <span>{t.sortByRating}</span>
          </button>

          {/* Favorites only filter button */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
              onlyFavorites
                ? 'bg-amber-400 text-stone-900 shadow-sm'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-stone-900' : ''}`} />
            <span className="hidden sm:inline">Kegemaran</span>
          </button>
        </div>
      </div>

      {/* Halal & Dietary Quick Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] font-extrabold text-stone-500 dark:text-stone-400 shrink-0 mr-1 flex items-center gap-1">
          <Utensils className="w-3.5 h-3.5 text-[#0e7c66]" />
          <span>Diet:</span>
        </span>

        <button
          onClick={() => setDietaryFilter('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            dietaryFilter === 'All'
              ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 shadow-xs'
              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
          }`}
        >
          {t.halalFilterAll}
        </button>

        <button
          onClick={() => setDietaryFilter('Vegetarian')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
            dietaryFilter === 'Vegetarian'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
          }`}
        >
          <Leaf className="w-3 h-3 text-teal-500" />
          <span>{t.dietaryFilterVegetarian}</span>
        </button>

        <button
          onClick={() => setDietaryFilter('Halal')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
            dietaryFilter === 'Halal'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
          }`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>{t.halalFilterHalalOnly}</span>
        </button>

        <button
          onClick={() => setDietaryFilter('Muslim-Friendly')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
            dietaryFilter === 'Muslim-Friendly'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          }`}
        >
          <span>{t.halalFilterMuslimFriendly}</span>
        </button>

        <button
          onClick={() => setDietaryFilter('Non-Halal')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
            dietaryFilter === 'Non-Halal'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <span>{t.halalFilterNonHalal}</span>
        </button>
      </div>

      {/* Cards Grid */}
      {filteredPlaces.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-stone-800 rounded-3xl p-6 border border-stone-200 dark:border-stone-700">
            <Filter className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">
              {t.noPlacesFound}
            </p>
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaces.map((place) => {
            const isFav = favoriteIds.includes(place.id);
            const isInRoute = routePlaceIds.includes(place.id);
            const userUploaded = customPhotos[place.id]?.length > 0;
            const photoUrl = customPhotos[place.id]?.[0] || place.images[0];
            const ratingSummary = calculatePlaceRatingSummary(place.id);

            return (
              <div
                key={place.id}
                onClick={() => onSelectPlace(place)}
                className="group bg-white dark:bg-stone-800/90 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-700/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col active:scale-98"
              >
                {/* Photo container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={place.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ImagePlaceholder category={place.category} name={place.name} />
                  )}

                  {/* Gradient shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Star Save / Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(place.id);
                    }}
                    title={isFav ? t.removeFromFavorites : t.saveToFavorites}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                      isFav
                        ? 'bg-amber-400 text-stone-900 shadow-md'
                        : 'bg-black/40 text-white hover:bg-black/60'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-stone-900' : ''}`} />
                  </button>

                  {/* Custom user photo badge */}
                  {userUploaded && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#0e7c66] text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <Camera className="w-2.5 h-2.5" />
                      {t.customPhotoBadge}
                    </span>
                  )}

                  {/* Category & Halal Tag */}
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-white text-[10px] font-bold shadow-xs">
                      {place.category}
                    </span>
                    {place.halalStatus && place.halalStatus !== 'General' && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-xs ${
                          place.halalStatus === 'Halal'
                            ? 'bg-emerald-600 text-white'
                            : place.halalStatus === 'Vegetarian'
                            ? 'bg-teal-700 text-white'
                            : place.halalStatus === 'Muslim-Friendly'
                            ? 'bg-amber-500 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {place.halalStatus === 'Halal' && <ShieldCheck className="w-2.5 h-2.5" />}
                        {place.halalStatus === 'Vegetarian' && (
                          <Leaf className="w-2.5 h-2.5" />
                        )}
                        {place.halalStatus === 'Muslim-Friendly' && <Utensils className="w-2.5 h-2.5" />}
                        {place.halalStatus === 'Non-Halal' && <AlertTriangle className="w-2.5 h-2.5" />}
                        <span>
                          {place.halalStatus === 'Halal'
                            ? t.halalBadge100
                            : place.halalStatus === 'Vegetarian'
                            ? t.vegBadgeVegetarian
                            : place.halalStatus === 'Muslim-Friendly'
                            ? t.halalBadgeMF
                            : t.halalBadgeNon}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* In Route Badge */}
                  {isInRoute && (
                    <span className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-full bg-[#e8973a] text-white text-[10px] font-bold">
                      {t.inRouteBadge}
                    </span>
                  )}
                </div>

                {/* Card Content Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-base text-stone-900 dark:text-white line-clamp-1 group-hover:text-[#0e7c66] dark:group-hover:text-emerald-400 transition-colors">
                      {place.name}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {language === 'en' ? place.descriptionEN : place.descriptionBM}
                    </p>
                  </div>

                  {/* Bottom Stats and Quick Route Action */}
                  <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#0e7c66]" />
                        ~{place.estimatedMinutes} {t.minutesUnit}
                      </span>
                      <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{ratingSummary.averageRating}</span>
                        <span className="text-stone-400 text-[10px] font-normal">({ratingSummary.totalReviews})</span>
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleRoute(place.id);
                      }}
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                        isInRoute
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-200'
                          : 'bg-emerald-50 dark:bg-emerald-950 text-[#0e7c66] dark:text-emerald-400 hover:bg-emerald-100'
                      }`}
                    >
                      {isInRoute ? (
                        <>
                          <Trash2 className="w-3 h-3" />
                          <span>{t.removeFromRoute}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>{t.addToRoute}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
