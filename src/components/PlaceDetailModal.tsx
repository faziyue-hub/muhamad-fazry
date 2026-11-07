/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlaceLocation, Language, DestinationFolder } from '../types.ts';
import { TRANSLATIONS } from '../utils/translations.ts';
import { ImagePlaceholder } from './ImagePlaceholder.tsx';
import {
  X,
  Star,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  Upload,
  RotateCcw,
  Compass,
  FolderPlus,
  Folder,
  Image as ImageIcon,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Utensils,
  MessageCircle,
  Send,
  Check,
  ThumbsUp,
  User,
  PenLine,
  Leaf,
} from 'lucide-react';
import { UserReview, PlaceRatingSummary, TravelerType } from '../types.ts';
import { RatingStars } from './RatingStars.tsx';
import {
  getReviewsForPlace,
  calculatePlaceRatingSummary,
  submitUserReview,
  deleteUserReview,
} from '../utils/reviewsManager.ts';

interface Props {
  place: PlaceLocation | null;
  onClose: () => void;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (placeId: string) => void;
  isInRoute: boolean;
  onToggleRoute: (placeId: string) => void;
  onShowOnMap: (place: PlaceLocation) => void;
  customPhotos: string[];
  onUploadPhoto: (placeId: string, photoDataUrl: string) => void;
  onResetPhotos: (placeId: string) => void;
  destinationFolders?: DestinationFolder[];
  onCreateFolderForPlace?: (placeId: string) => void;
  onOpenJournalFolder?: (folderId: string) => void;
  onSelectAlternativePlace?: (placeId: string) => void;
}

export const PlaceDetailModal: React.FC<Props> = ({
  place,
  onClose,
  language,
  isFavorite,
  onToggleFavorite,
  isInRoute,
  onToggleRoute,
  onShowOnMap,
  customPhotos,
  onUploadPhoto,
  onResetPhotos,
  destinationFolders = [],
  onCreateFolderForPlace,
  onOpenJournalFolder,
  onSelectAlternativePlace,
}) => {
  const t = TRANSLATIONS[language];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [imgLoadError, setImgLoadError] = useState<{ [index: number]: boolean }>({});
  const [isAutoCycling, setIsAutoCycling] = useState(true);

  // User Ratings & Reviews state
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [ratingSummary, setRatingSummary] = useState<PlaceRatingSummary>({
    averageRating: 4.8,
    totalReviews: 24,
    breakdown: { 5: 20, 4: 3, 3: 1, 2: 0, 1: 0 },
  });
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [newUserName, setNewUserName] = useState<string>('');
  const [newTravelerType, setNewTravelerType] = useState<TravelerType>('solo');
  const [reviewToast, setReviewToast] = useState<boolean>(false);

  // Sync reviews when place changes
  useEffect(() => {
    if (place) {
      setReviews(getReviewsForPlace(place.id));
      setRatingSummary(calculatePlaceRatingSummary(place.id));
      setIsWritingReview(false);
      setNewRating(5);
      setNewComment('');
      setNewUserName('');
    }
  }, [place?.id]);

  // Combine custom photos (if any) with original photos
  const displayPhotos = place ? (customPhotos.length > 0 ? customPhotos : place.images) : [];
  const totalPhotos = displayPhotos.length;

  // Auto transition when > 1 image
  useEffect(() => {
    if (totalPhotos <= 1 || !isAutoCycling) return;

    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % totalPhotos);
    }, 3500);

    return () => clearInterval(timer);
  }, [totalPhotos, isAutoCycling]);

  if (!place) return null;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!place || !newComment.trim()) return;

    submitUserReview(place.id, {
      userName: newUserName.trim() || (language === 'en' ? 'Visitor' : 'Pelancong'),
      rating: newRating,
      comment: newComment.trim(),
      travelerType: newTravelerType,
    });

    const updatedReviews = getReviewsForPlace(place.id);
    setReviews(updatedReviews);
    setRatingSummary(calculatePlaceRatingSummary(place.id));
    setIsWritingReview(false);
    setNewComment('');
    setReviewToast(true);
    setTimeout(() => setReviewToast(false), 3000);
  };

  const handleDeleteReview = (reviewId: string) => {
    if (!place) return;
    if (window.confirm(t.deleteReviewConfirm)) {
      deleteUserReview(reviewId);
      setReviews(getReviewsForPlace(place.id));
      setRatingSummary(calculatePlaceRatingSummary(place.id));
    }
  };

  const handleNextPhoto = () => {
    setCurrentImgIndex((prev) => (prev + 1) % totalPhotos);
  };

  const handlePrevPhoto = () => {
    setCurrentImgIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'en' ? 'File too large (max 5MB)' : 'Fail terlalu besar (maksimum 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUploadPhoto(place.id, reader.result);
          setCurrentImgIndex(0);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const categoryBadgeColors = () => {
    switch (place.category) {
      case 'Makanan':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'Alam':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Kampung':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300';
      default:
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-xl max-h-[92vh] bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800 transition-colors animate-in slide-in-from-bottom duration-200"
        role="dialog"
      >
        {/* Top Header Floating Buttons */}
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Favorite Star button */}
          <button
            onClick={() => onToggleFavorite(place.id)}
            className={`absolute top-4 left-4 z-20 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${
              isFavorite
                ? 'bg-amber-400 text-stone-900 shadow-md'
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
            aria-label="Kegemaran"
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-stone-900' : ''}`} />
          </button>

          {/* Photo Carousel Container with Smooth Auto-Crossfade Transition */}
          <div className="relative w-full aspect-[16/10] bg-stone-950 overflow-hidden">
            {displayPhotos.length > 0 && !imgLoadError[currentImgIndex] ? (
              displayPhotos.map((photoUrl: string, idx: number) => (
                <img
                  key={idx}
                  src={photoUrl}
                  alt={place.name}
                  referrerPolicy="no-referrer"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                    idx === currentImgIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                  onError={() =>
                    setImgLoadError((prev) => ({ ...prev, [idx]: true }))
                  }
                />
              ))
            ) : (
              <ImagePlaceholder
                category={place.category}
                name={place.name}
                aspectRatio="wide"
                className="h-full rounded-none"
              />
            )}

            {/* Gradient shadow for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-10 pointer-events-none" />

            {/* Prev / Next arrows if more than 1 image */}
            {totalPhotos > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
                  aria-label="Gambar sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
                  aria-label="Gambar seterusnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Pagination dots */}
            {totalPhotos > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-20">
                {displayPhotos.map((_: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImgIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentImgIndex === idx
                        ? 'w-6 bg-white shadow-sm'
                        : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Lihat gambar ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* User Custom Photo Badge if active */}
            {customPhotos.length > 0 && (
              <div className="absolute top-4 left-16 z-20 px-2.5 py-1 rounded-full bg-[#0e7c66] text-white text-[11px] font-bold shadow-md flex items-center gap-1">
                <span>{t.customPhotoBadge}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Details Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Title & Category Bar */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${categoryBadgeColors()}`}
              >
                {place.category}
              </span>

              {/* Halal / Vegetarian / Dietary Status Badge */}
              {place.halalStatus && place.halalStatus !== 'General' && (
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                    place.halalStatus === 'Halal'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : place.halalStatus === 'Vegetarian'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : place.halalStatus === 'Muslim-Friendly'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-rose-600 text-white shadow-xs'
                  }`}
                >
                  {place.halalStatus === 'Halal' && <ShieldCheck className="w-3.5 h-3.5" />}
                  {place.halalStatus === 'Vegetarian' && (
                    <Leaf className="w-3.5 h-3.5" />
                  )}
                  {place.halalStatus === 'Muslim-Friendly' && <Utensils className="w-3.5 h-3.5" />}
                  {place.halalStatus === 'Non-Halal' && <AlertTriangle className="w-3.5 h-3.5" />}
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

              {/* User Rating Badge */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('user-reviews-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1 text-xs font-black text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 rounded-full cursor-pointer hover:bg-amber-200 transition-colors shadow-xs"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{ratingSummary.averageRating}</span>
                <span className="text-[11px] font-normal text-amber-700 dark:text-amber-300">
                  ({ratingSummary.totalReviews})
                </span>
              </button>

              <span className="flex items-center text-xs font-semibold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 mr-1 text-[#0e7c66]" />
                ~{place.estimatedMinutes} {t.minutesUnit}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white leading-tight">
              {place.name}
            </h2>
            {place.address && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                {place.address}
              </p>
            )}
          </div>

          {/* Dedicated Halal & Dietary Guidance Box */}
          {place.halalStatus && place.halalStatus !== 'General' && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                place.halalStatus === 'Halal'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                  : place.halalStatus === 'Vegetarian'
                  ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60'
                  : place.halalStatus === 'Muslim-Friendly'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    place.halalStatus === 'Halal'
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                      : place.halalStatus === 'Vegetarian'
                      ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300'
                      : place.halalStatus === 'Muslim-Friendly'
                      ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {place.halalStatus === 'Halal' && <ShieldCheck className="w-5 h-5" />}
                  {place.halalStatus === 'Vegetarian' && (
                    <Leaf className="w-5 h-5" />
                  )}
                  {place.halalStatus === 'Muslim-Friendly' && <Utensils className="w-5 h-5" />}
                  {place.halalStatus === 'Non-Halal' && <AlertTriangle className="w-5 h-5" />}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4
                      className={`text-xs font-black uppercase tracking-wider ${
                        place.halalStatus === 'Halal'
                          ? 'text-emerald-800 dark:text-emerald-300'
                          : place.halalStatus === 'Vegetarian'
                          ? 'text-teal-800 dark:text-teal-300'
                          : place.halalStatus === 'Muslim-Friendly'
                          ? 'text-amber-800 dark:text-amber-300'
                          : 'text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {place.halalStatus === 'Halal' && (language === 'en' ? '🟢 100% Halal Verified' : '🟢 100% Disahkan Halal')}
                      {place.halalStatus === 'Vegetarian' && (language === 'en' ? '🌱 Vegetarian Choice' : '🌱 Pilihan Vegetarian')}
                      {place.halalStatus === 'Muslim-Friendly' && (language === 'en' ? '🟡 Muslim-Friendly Hub' : '🟡 Destinasi Mesra Muslim')}
                      {place.halalStatus === 'Non-Halal' && (language === 'en' ? '🔴 Non-Halal Notice' : '🔴 Peringatan: Bukan Halal')}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                      {language === 'en' ? 'Dietary Guidance' : 'Panduan Pemakanan'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 leading-relaxed font-medium">
                    {language === 'en'
                      ? (place.dietaryDetailsEN || place.halalDetailsEN)
                      : (place.dietaryDetailsBM || place.halalDetailsBM)}
                  </p>

                  {/* If Non-Halal, offer quick jump to Halal alternatives */}
                  {place.halalStatus === 'Non-Halal' && onSelectAlternativePlace && (
                    <div className="pt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                        {language === 'en' ? 'Muslim Alternatives:' : 'Cadangan Pilihan Halal:'}
                      </span>
                      <button
                        onClick={() => onSelectAlternativePlace('medan-selera-harmoni')}
                        className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-95"
                      >
                        <span>Medan Selera Harmoni</span>
                      </button>
                      <button
                        onClick={() => onSelectAlternativePlace('mee-kampua-halal-sibu')}
                        className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-95"
                      >
                        <span>Mee Kampua Halal Sibu</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
            {language === 'en' ? place.descriptionEN : place.descriptionBM}
          </div>

          {/* Highlight Card: Fakta Menarik */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-200/80 dark:bg-amber-900/60 flex items-center justify-center shrink-0 text-amber-800 dark:text-amber-200">
                <Sparkles className="w-4 h-4 text-[#e8973a]" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                  {t.interestingFact}
                </h4>
                <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 leading-relaxed font-medium">
                  {language === 'en' ? place.interestingFactEN : place.interestingFactBM}
                </p>
              </div>
            </div>
          </div>

          {/* Practical Info Grid (Best Time & Local Tips) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Best Time */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
              <div className="flex items-center gap-2 mb-1.5 text-stone-800 dark:text-stone-200 font-bold text-xs">
                <Clock className="w-4 h-4 text-[#0e7c66]" />
                {t.bestTime}
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {language === 'en' ? place.bestTimeToVisitEN : place.bestTimeToVisitBM}
              </p>
            </div>

            {/* Local Tips */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
              <div className="flex items-center gap-2 mb-1.5 text-stone-800 dark:text-stone-200 font-bold text-xs">
                <Compass className="w-4 h-4 text-[#e8973a]" />
                {t.localTips}
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {language === 'en' ? place.localTipsEN : place.localTipsBM}
              </p>
            </div>
          </div>

          {/* Opening hours note / safety disclaimer */}
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-600 dark:text-stone-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <span>
              {language === 'en'
                ? place.openingHoursNoteEN || t.safetyDisclaimer
                : place.openingHoursNoteBM || t.safetyDisclaimer}
            </span>
          </div>

          {/* User Reviews & Ratings Section */}
          <div id="user-reviews-section" className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h4 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>{t.userReviewsTitle}</span>
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {t.userReviewsSubtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsWritingReview(!isWritingReview)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0e7c66] to-[#0b6754] text-white text-xs font-bold hover:opacity-95 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>{isWritingReview ? t.close : t.writeReviewBtn}</span>
              </button>
            </div>

            {/* Score & Breakdown Overview Card */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-800/80 border border-amber-200/80 dark:border-stone-700 grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
              {/* Left Score Block */}
              <div className="sm:col-span-2 text-center sm:text-left flex flex-col items-center sm:items-start justify-center sm:border-r border-amber-200/80 dark:border-stone-700 sm:pr-4">
                <span className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
                  {ratingSummary.averageRating}
                </span>
                <div className="my-1">
                  <RatingStars rating={ratingSummary.averageRating} size="sm" />
                </div>
                <span className="text-[11px] text-stone-600 dark:text-stone-300 font-semibold">
                  {ratingSummary.totalReviews} {t.reviewsCountUnit} ({t.basedOnReviews})
                </span>
              </div>

              {/* Right Star Breakdown Bars */}
              <div className="sm:col-span-3 space-y-1.5 text-xs">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingSummary.breakdown[star] || 0;
                  const percent = ratingSummary.totalReviews > 0 ? (count / ratingSummary.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                      <span className="w-4 text-right font-bold">{star}★</span>
                      <div className="flex-1 h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-[10px] text-stone-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Success Toast */}
            {reviewToast && (
              <div className="p-3 rounded-2xl bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-md">
                <Check className="w-4 h-4" />
                <span>{t.reviewSubmittedToast}</span>
              </div>
            )}

            {/* Write Review Collapsible Form */}
            {isWritingReview && (
              <form
                onSubmit={handleAddReview}
                className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-[#0e7c66]/40 dark:border-emerald-600/40 shadow-md space-y-3 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider">
                    {t.writeReviewBtn}
                  </span>
                  <span className="text-[10px] font-bold text-[#0e7c66] dark:text-emerald-400">
                    {newRating === 5 && '🌟 Cemerlang & Memuaskan!'}
                    {newRating === 4 && '👍 Sangat Baik'}
                    {newRating === 3 && '👌 Baik'}
                    {newRating === 2 && '😐 Sederhana'}
                    {newRating === 1 && '👎 Kurang Memuaskan'}
                  </span>
                </div>

                {/* Interactive Star Picker */}
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {t.yourRatingLabel}:
                  </span>
                  <RatingStars
                    rating={newRating}
                    size="lg"
                    interactive={true}
                    onRatingChange={(r) => setNewRating(r)}
                  />
                </div>

                {/* Name & Trip Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                      {t.yourNameLabel}
                    </label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e7c66]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                      {t.travelerTypeLabel}
                    </label>
                    <select
                      value={newTravelerType}
                      onChange={(e) => setNewTravelerType(e.target.value as TravelerType)}
                      className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e7c66]"
                    >
                      <option value="solo">🧳 {t.travelerSolo}</option>
                      <option value="family">👨‍👩‍👧 {t.travelerFamily}</option>
                      <option value="couple">👫 {t.travelerCouple}</option>
                      <option value="friends">👥 {t.travelerFriends}</option>
                      <option value="local">🏡 {t.travelerLocal}</option>
                    </select>
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                    {t.reviewCommentLabel} *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t.reviewPlaceholder}
                    className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e7c66] resize-none leading-relaxed"
                  />
                </div>

                {/* Submit button */}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsWritingReview(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer"
                  >
                    {t.cancelStory}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0e7c66] to-[#0b6754] text-white text-xs font-extrabold hover:opacity-95 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.submitReviewBtn}</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of Reviews */}
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="p-4 text-center rounded-2xl bg-stone-50 dark:bg-stone-800/50 text-stone-500 text-xs">
                  {t.noReviewsYet}
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/70 space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0e7c66] dark:text-emerald-400 flex items-center justify-center text-xs font-black">
                          {rev.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-stone-900 dark:text-white">
                              {rev.userName}
                            </span>
                            {rev.isUserSubmitted && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                Anda
                              </span>
                            )}
                            <span className="text-[10px] text-stone-400">
                              • {rev.travelerType === 'family' ? '👨‍👩‍👧 Keluarga' : rev.travelerType === 'couple' ? '👫 Pasangan' : rev.travelerType === 'friends' ? '👥 Kawan' : rev.travelerType === 'local' ? '🏡 Tempatan' : '🧳 Solo'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-stone-400">{rev.date}</span>
                        {rev.isUserSubmitted && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            title="Padam ulasan"
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Star Row */}
                    <div className="flex items-center gap-1.5">
                      <RatingStars rating={rev.rating} size="xs" />
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        {rev.rating}.0
                      </span>
                    </div>

                    {/* Review Comment */}
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-normal">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Destination Memory Folders Section */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-[#0e7c66]" />
                  <span>{t.myFoldersForThisPlace}</span>
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {destinationFolders.filter((f) => f.placeId === place.id).length > 0
                    ? `${destinationFolders.filter((f) => f.placeId === place.id).length} folder dicipta untuk destinasi ini`
                    : 'Cipta folder untuk simpan gambar anda semasa melawat tempat ini'}
                </p>
              </div>

              {onCreateFolderForPlace && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCreateFolderForPlace(place.id);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#0e7c66] dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ Folder</span>
                </button>
              )}
            </div>

            {/* List of existing folders for this place */}
            {destinationFolders.filter((f) => f.placeId === place.id).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {destinationFolders
                  .filter((f) => f.placeId === place.id)
                  .map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => {
                        onClose();
                        onOpenJournalFolder && onOpenJournalFolder(folder.id);
                      }}
                      className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-2.5 hover:border-[#0e7c66] transition-all cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-900 shrink-0 relative">
                        {folder.photos[0] ? (
                          <img
                            src={folder.photos[0].dataUrl}
                            alt={folder.folderName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Folder className="w-5 h-5 text-[#0e7c66]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-stone-900 dark:text-white truncate group-hover:text-[#0e7c66]">
                          {folder.folderName}
                        </h5>
                        <span className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                          <ImageIcon className="w-2.5 h-2.5 text-[#e8973a]" />
                          {folder.photos.length} {t.photosCount} • {folder.visitedDate}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Upload Custom Photo Section */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                  {t.uploadPhotoTitle}
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {t.uploadPhotoDesc}
                </p>
              </div>
              {customPhotos.length > 0 && (
                <button
                  onClick={() => onResetPhotos(place.id)}
                  className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t.resetDefaultPhotos}
                </button>
              )}
            </div>

            <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-[#0e7c66] dark:hover:border-emerald-500 bg-stone-50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer active:scale-98 transition-all">
              <Upload className="w-4 h-4 text-[#0e7c66]" />
              <span>{t.chooseImageFile}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Bottom Actions Sticky Footer (Thumb-friendly) */}
        <div className="p-4 bg-stone-50 dark:bg-stone-900/90 border-t border-stone-200 dark:border-stone-800 flex items-center gap-3">
          {/* Show on Map Button */}
          <button
            onClick={() => {
              onClose();
              onShowOnMap(place);
            }}
            className="flex-1 py-3 px-4 rounded-2xl border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs sm:text-sm hover:bg-stone-200 dark:hover:bg-stone-800 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-[#e8973a]" />
            <span>{t.viewOnMap}</span>
          </button>

          {/* Add / Remove from Route Button */}
          <button
            onClick={() => onToggleRoute(place.id)}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isInRoute
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-gradient-to-r from-[#0e7c66] to-[#0b6754] hover:opacity-95 shadow-[#0e7c66]/20'
            }`}
          >
            {isInRoute ? (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{t.removeFromRoute}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{t.addToRoute}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
