/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlaceLocation, PlaceCategory, Language, SibuFact, UserCustomPhotos, DietaryOption } from '../types.ts';
import { TRANSLATIONS } from '../utils/translations.ts';
import { calculatePlaceRatingSummary } from '../utils/reviewsManager.ts';
import { ImagePlaceholder } from './ImagePlaceholder.tsx';
import { WeatherWidget } from './WeatherWidget.tsx';
import {
  Search,
  Sparkles,
  Clock,
  Star,
  Plus,
  Trash2,
  ArrowRight,
  MessageSquare,
  Compass,
  Landmark,
  HeartHandshake,
  Utensils,
  MapPin,
  Flame,
  FolderHeart,
  FolderPlus,
  ShieldCheck,
  AlertTriangle,
  Share2,
  Leaf,
} from 'lucide-react';

interface Props {
  places: PlaceLocation[];
  facts: SibuFact[];
  language: Language;
  onSelectPlace: (place: PlaceLocation) => void;
  onNavigateTab: (tab: 'gallery' | 'map' | 'itinerary' | 'journal' | 'chat') => void;
  onOpenAiPlanner: () => void;
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  routePlaceIds: string[];
  onToggleRoute: (id: string) => void;
  customPhotos: UserCustomPhotos;
  foldersCount?: number;
  onOpenCreateFolder?: () => void;
  onOpenShareJourney?: () => void;
}

export const HomeTab: React.FC<Props> = ({
  places,
  facts,
  language,
  onSelectPlace,
  onNavigateTab,
  onOpenAiPlanner,
  favoriteIds,
  onToggleFavorite,
  routePlaceIds,
  onToggleRoute,
  customPhotos,
  foldersCount = 0,
  onOpenCreateFolder,
  onOpenShareJourney,
}) => {
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'Semua'>('Semua');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryOption>('All');

  const categories: (PlaceCategory | 'Semua')[] = ['Semua', 'Makanan', 'Budaya', 'Alam', 'Kampung'];

  // Filter places based on search query, category, and dietary status
  const filteredPlaces = places.filter((p) => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;

    // Dietary / Halal / Vegetarian filter
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
    if (!query) return matchesCategory && matchesDietary;

    const matchesName = p.name.toLowerCase().includes(query);
    const matchesDesc =
      p.descriptionBM.toLowerCase().includes(query) ||
      p.descriptionEN.toLowerCase().includes(query) ||
      p.localTipsBM.toLowerCase().includes(query);
    const matchesCat = p.category.toLowerCase().includes(query);

    return matchesCategory && matchesDietary && (matchesName || matchesDesc || matchesCat);
  });

  // Pick a featured spot (e.g. Sibu Central Market or first place)
  const featuredPlace = places.find((p) => p.id === 'pasar-pusat-sibu') || places[0];
  const featuredPhotos =
    customPhotos[featuredPlace?.id]?.length > 0
      ? customPhotos[featuredPlace.id]
      : featuredPlace?.images || [];
  const [featuredPhotoIndex, setFeaturedPhotoIndex] = useState(0);

  // Auto transition when featured place has > 1 image
  useEffect(() => {
    if (featuredPhotos.length <= 1) return;
    const timer = setInterval(() => {
      setFeaturedPhotoIndex((prev) => (prev + 1) % featuredPhotos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [featuredPhotos.length]);

  const featuredImage = featuredPhotos[featuredPhotoIndex] || featuredPhotos[0];
  const isFeaturedFav = favoriteIds.includes(featuredPlace?.id || '');
  const isFeaturedInRoute = routePlaceIds.includes(featuredPlace?.id || '');

  const getFactIcon = (name: string) => {
    switch (name) {
      case 'Sparkles':
        return Sparkles;
      case 'Landmark':
        return Landmark;
      case 'Compass':
        return Compass;
      case 'HeartHandshake':
        return HeartHandshake;
      case 'Utensils':
        return Utensils;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-3">
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

      {/* Live Sibu Weather Widget (Free Open-Meteo API) */}
      {!searchQuery && (
        <WeatherWidget language={language} />
      )}

      {/* Category Pills (Easy one-hand horizontal swipe) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-[#0e7c66] to-[#0b6754] text-white shadow-md shadow-[#0e7c66]/20'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700/80 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
            >
              {cat === 'Semua' ? t.catAll : cat}
            </button>
          );
        })}
      </div>

      {/* Halal, Vegetarian & Dietary Quick Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-0.5">
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

      {/* "Tempat Pilihan Hari Ini" (Featured Card with Large Photo) */}
      {featuredPlace && !searchQuery && selectedCategory === 'Semua' && (
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#e8973a] fill-[#e8973a]" />
              <h3 className="text-sm font-extrabold text-stone-900 dark:text-white uppercase tracking-wider">
                {t.featuredTitle}
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {t.featuredBadge}
            </span>
          </div>

          <div className="relative group rounded-3xl overflow-hidden bg-stone-900 shadow-xl border border-stone-200 dark:border-stone-800 transition-all hover:shadow-2xl">
            {/* Big Photo with Smooth Auto-Crossfade Transition */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[21/10] overflow-hidden bg-stone-950">
              {featuredPhotos.length > 0 ? (
                featuredPhotos.map((photoUrl: string, pIdx: number) => (
                  <img
                    key={pIdx}
                    src={photoUrl}
                    alt={featuredPlace.name}
                    referrerPolicy="no-referrer"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                      pIdx === featuredPhotoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    } group-hover:scale-105 transition-transform duration-700`}
                  />
                ))
              ) : (
                <ImagePlaceholder
                  category={featuredPlace.category}
                  name={featuredPlace.name}
                  aspectRatio="wide"
                />
              )}

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 z-10 pointer-events-none" />

              {/* Pagination Dots for Auto Slideshow */}
              {featuredPhotos.length > 1 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                  {featuredPhotos.map((_: string, dotIdx: number) => (
                    <button
                      key={dotIdx}
                      onClick={() => setFeaturedPhotoIndex(dotIdx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        dotIdx === featuredPhotoIndex
                          ? 'w-5 bg-amber-400'
                          : 'w-1.5 bg-white/60 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Floating Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(featuredPlace.id);
                }}
                className={`absolute top-4 right-4 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                  isFeaturedFav
                    ? 'bg-amber-400 text-stone-900 shadow-lg'
                    : 'bg-black/40 text-white hover:bg-black/60'
                }`}
                aria-label="Kegemaran"
              >
                <Star className={`w-4 h-4 ${isFeaturedFav ? 'fill-stone-900' : ''}`} />
              </button>

              {/* Category, Time & Rating Tag */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#0e7c66] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                  {featuredPlace.category}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/50 text-white text-[11px] font-semibold backdrop-blur-md flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#e8973a]" />~{featuredPlace.estimatedMinutes} {t.minutesUnit}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/50 text-amber-300 text-[11px] font-bold backdrop-blur-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{calculatePlaceRatingSummary(featuredPlace.id).averageRating}</span>
                  <span className="text-stone-300 text-[10px] font-normal">({calculatePlaceRatingSummary(featuredPlace.id).totalReviews})</span>
                </span>
              </div>

              {/* Card Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white space-y-2">
                <h4 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
                  {featuredPlace.name}
                </h4>
                <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 leading-relaxed">
                  {language === 'en' ? featuredPlace.descriptionEN : featuredPlace.descriptionBM}
                </p>

                {/* Bottom Action Row */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => onSelectPlace(featuredPlace)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#e8973a] hover:bg-[#d28227] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{t.exploreButton}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleRoute(featuredPlace.id);
                    }}
                    className={`py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 backdrop-blur-md active:scale-95 transition-all cursor-pointer ${
                      isFeaturedInRoute
                        ? 'bg-rose-600 text-white'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    {isFeaturedInRoute ? (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.inRouteBadge}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.addToRoute}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Two Prominent Quick Action Cards (Jana Laluan AI & Tanya Dias) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Card 1: Jana Laluan AI */}
        <div
          onClick={onOpenAiPlanner}
          className="p-4 rounded-3xl bg-gradient-to-br from-[#0e7c66] to-[#074236] text-white shadow-lg shadow-[#0e7c66]/15 hover:shadow-xl transition-all cursor-pointer active:scale-98 flex items-start gap-3.5"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-sm sm:text-base">
                {t.quickPlan}
              </h4>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400 text-stone-900">
                Pantas
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-1 leading-snug">
              {t.quickPlanDesc}
            </p>
          </div>
        </div>

        {/* Card 2: Tanya Dias (AI Assistant) */}
        <div
          onClick={() => onNavigateTab('chat')}
          className="p-4 rounded-3xl bg-gradient-to-br from-[#e8973a] to-[#b56b15] text-white shadow-lg shadow-[#e8973a]/15 hover:shadow-xl transition-all cursor-pointer active:scale-98 flex items-start gap-3.5"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-sm sm:text-base">
                {t.askDiasBanner}
              </h4>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 text-white">
                AI Sibu
              </span>
            </div>
            <p className="text-xs text-amber-100 mt-1 leading-snug">
              {t.askDiasDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Destination Album & Photo Journal Quick Card */}
      <section>
        <div
          onClick={() => onNavigateTab('journal')}
          className="p-4 rounded-3xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-98 flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-[#e8973a] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white group-hover:text-[#0e7c66] dark:group-hover:text-emerald-400 transition-colors">
                  {t.journalTitle}
                </h4>
                {foldersCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0e7c66] text-white">
                    {foldersCount} folder
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                {t.journalSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenShareJourney && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenShareJourney();
                }}
                title={t.shareJourneyBtn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.shareJourneyBtn}</span>
              </button>
            )}

            {onOpenCreateFolder && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCreateFolder();
                }}
                title={t.createFolder}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-700 hover:bg-[#0e7c66] hover:text-white text-stone-700 dark:text-stone-300 text-xs font-bold transition-all cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Folder</span>
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-700/60 flex items-center justify-center text-stone-600 dark:text-stone-300 group-hover:bg-[#0e7c66] group-hover:text-white transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Seksyen Khas: Zon Restoran Vegetarian Sibu */}
      {!searchQuery && selectedCategory === 'Semua' && (
        <section className="p-5 rounded-3xl bg-gradient-to-br from-teal-800 via-emerald-900 to-teal-950 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-emerald-300">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      {t.vegSectionTitle}
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-400 text-stone-900">
                      {t.vegFeatureTag}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/90 mt-0.5 line-clamp-1">
                    {t.vegSectionSubtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setDietaryFilter('Vegetarian');
                  onNavigateTab('gallery');
                }}
                className="text-xs font-bold text-white hover:text-emerald-200 flex items-center gap-1 cursor-pointer bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-all"
              >
                <span>{t.vegExploreBtn}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Vegetarian restaurants culinary highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {places
                .filter((p) => p.halalStatus === 'Vegetarian')
                .map((vPlace) => {
                  const photoUrl = customPhotos[vPlace.id]?.[0] || vPlace.images[0];
                  const rSummary = calculatePlaceRatingSummary(vPlace.id);
                  return (
                    <div
                      key={vPlace.id}
                      onClick={() => onSelectPlace(vPlace)}
                      className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer flex items-center gap-3 group active:scale-98"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-900 relative">
                        <img
                          src={photoUrl}
                          alt={vPlace.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-teal-300 text-stone-900">
                            Vegetarian
                          </span>
                          <span className="text-[10px] text-amber-300 font-bold flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-300" />
                            {rSummary.averageRating} ({rSummary.totalReviews})
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate mt-1 group-hover:text-emerald-200 transition-colors">
                          {vPlace.name}
                        </h4>
                        <p className="text-[11px] text-emerald-100/80 line-clamp-1 mt-0.5">
                          {language === 'en' ? vPlace.dietaryDetailsEN || vPlace.descriptionEN : vPlace.dietaryDetailsBM || vPlace.descriptionBM}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* Places Grid Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0e7c66]" />
            {searchQuery
              ? `Hasil Carian (${filteredPlaces.length})`
              : t.popularSpots}
          </h3>
          <button
            onClick={() => onNavigateTab('gallery')}
            className="text-xs font-bold text-[#0e7c66] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-stone-800 rounded-3xl p-6 border border-stone-200 dark:border-stone-700">
            <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">
              {t.noPlacesFound}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPlaces.slice(0, 6).map((place) => {
              const photoUrl = customPhotos[place.id]?.[0] || place.images[0];
              const isFav = favoriteIds.includes(place.id);
              const isInRoute = routePlaceIds.includes(place.id);
              const ratingSummary = calculatePlaceRatingSummary(place.id);

              return (
                <div
                  key={place.id}
                  onClick={() => onSelectPlace(place)}
                  className="group bg-white dark:bg-stone-800/90 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-700/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col active:scale-98"
                >
                  {/* Photo with Overlay */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={place.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ImagePlaceholder
                        category={place.category}
                        name={place.name}
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(place.id);
                      }}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all cursor-pointer ${
                        isFav
                          ? 'bg-amber-400 text-stone-900 shadow'
                          : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                      aria-label="Kegemaran"
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-stone-900' : ''}`} />
                    </button>

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
                              : place.halalStatus === 'Muslim-Friendly'
                              ? 'bg-amber-500 text-white'
                              : place.halalStatus === 'Vegetarian'
                              ? 'bg-teal-700 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {place.halalStatus === 'Halal' && <ShieldCheck className="w-2.5 h-2.5" />}
                          {place.halalStatus === 'Vegetarian' && <Leaf className="w-2.5 h-2.5" />}
                          {place.halalStatus === 'Non-Halal' && <AlertTriangle className="w-2.5 h-2.5" />}
                          <span>
                            {place.halalStatus === 'Halal'
                              ? t.halalBadge100
                              : place.halalStatus === 'Muslim-Friendly'
                              ? t.halalBadgeMF
                              : place.halalStatus === 'Vegetarian'
                              ? t.vegBadgeVegetarian
                              : t.halalBadgeNon}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* In Route indicator */}
                    {isInRoute && (
                      <span className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-full bg-[#e8973a] text-white text-[10px] font-bold">
                        {t.inRouteBadge}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-base text-stone-900 dark:text-white line-clamp-1 group-hover:text-[#0e7c66] dark:group-hover:text-emerald-400 transition-colors">
                        {place.name}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                        {language === 'en'
                          ? place.descriptionEN
                          : place.descriptionBM}
                      </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#0e7c66]" />
                          ~{place.estimatedMinutes} {t.minutesUnit}
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{ratingSummary.averageRating}</span>
                          <span className="text-stone-400 text-[10px] font-normal">({ratingSummary.totalReviews})</span>
                        </span>
                      </div>
                      <span className="font-bold text-[#0e7c66] dark:text-emerald-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        <span>{t.exploreButton}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bahagian "Tentang Sibu": 5 Fakta Ringkas Sejarah & Budaya */}
      <section className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
        <div>
          <span className="text-xs font-bold text-[#e8973a] uppercase tracking-wider">
            {t.tagline}
          </span>
          <h3 className="text-lg font-black text-stone-900 dark:text-white mt-0.5">
            {t.aboutSibuTitle}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t.aboutSibuSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {facts.map((fact) => {
            const Icon = getFactIcon(fact.iconName);
            return (
              <div
                key={fact.id}
                className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80 shadow-sm flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0e7c66] dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                    {language === 'en' ? fact.titleEN : fact.titleBM}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                    {language === 'en' ? fact.factEN : fact.factBM}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
