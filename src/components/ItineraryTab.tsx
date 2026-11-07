/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlaceLocation, Language, UserCustomPhotos } from '../types.ts';
import { TRANSLATIONS } from '../utils/translations.ts';
import { exportItineraryAsTxt, printItineraryDocument } from '../utils/storage.ts';
import {
  Clock,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sparkles,
  Download,
  Printer,
  RotateCcw,
  Route,
  Compass,
  MapPin,
  FolderPlus,
  Share2,
} from 'lucide-react';

interface Props {
  places: PlaceLocation[];
  routePlaceIds: string[];
  language: Language;
  onSelectPlace: (place: PlaceLocation) => void;
  onMovePlace: (fromIndex: number, toIndex: number) => void;
  onRemoveFromRoute: (placeId: string) => void;
  onClearRoute: () => void;
  onOpenAiPlanner: () => void;
  onNavigateTab: (tab: 'gallery' | 'map') => void;
  customPhotos: UserCustomPhotos;
  onCreateFolderForPlace?: (placeId: string) => void;
  onOpenShareJourney?: () => void;
}

export const ItineraryTab: React.FC<Props> = ({
  places,
  routePlaceIds,
  language,
  onSelectPlace,
  onMovePlace,
  onRemoveFromRoute,
  onClearRoute,
  onOpenAiPlanner,
  onNavigateTab,
  customPhotos,
  onCreateFolderForPlace,
  onOpenShareJourney,
}) => {
  const t = TRANSLATIONS[language];

  // Resolve the full place objects in order
  const routePlaces: PlaceLocation[] = routePlaceIds
    .map((id) => places.find((p) => p.id === id))
    .filter((p): p is PlaceLocation => p !== undefined);

  // Calculate total estimated minutes
  const totalVisitMinutes = routePlaces.reduce((sum, p) => sum + p.estimatedMinutes, 0);
  // Estimate ~15 mins transit between stops
  const totalTransitMinutes = Math.max(0, (routePlaces.length - 1) * 15);
  const grandTotalMinutes = totalVisitMinutes + totalTransitMinutes;
  const grandTotalHours = (grandTotalMinutes / 60).toFixed(1);

  const handleExportTxt = () => {
    if (routePlaces.length === 0) return;
    exportItineraryAsTxt(routePlaces, grandTotalMinutes, language);
  };

  const handlePrintPdf = () => {
    if (routePlaces.length === 0) return;
    printItineraryDocument();
  };

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 pt-3">
      {/* Title & Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Route className="w-5 h-5 text-[#0e7c66]" />
            {t.itineraryTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {t.itinerarySubtitle}
          </p>
        </div>

        {/* Action button: AI Route generator */}
        <button
          onClick={onOpenAiPlanner}
          className="self-start sm:self-auto px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#0e7c66] to-[#0b6754] text-white text-xs font-bold shadow-md hover:opacity-95 active:scale-95 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>{t.generateWithAi}</span>
        </button>
      </div>

      {routePlaces.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 px-6 bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200 dark:border-stone-700/80 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0e7c66] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-black text-stone-900 dark:text-white">
              {t.emptyItineraryTitle}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
              {t.emptyItineraryDesc}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenAiPlanner}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#0e7c66] text-white text-xs font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t.quickPlan}</span>
            </button>
            <button
              onClick={() => onNavigateTab('gallery')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-700 active:scale-95 transition-all cursor-pointer"
            >
              <span>Pilih dari Galeri</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Itinerary List */
        <div className="space-y-4">
          {/* Quick Stats Card */}
          <div className="p-4 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0e7c66] text-white flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {t.totalEstimatedTime}
                </span>
                <h4 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                  ~{grandTotalMinutes} {t.minutesUnit} (~{grandTotalHours} {t.hoursUnit})
                </h4>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white dark:bg-stone-800 text-[#0e7c66] dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-900">
              {routePlaces.length} {t.routeStopsCount}
            </span>
          </div>

          {/* Stops List */}
          <div className="space-y-3">
            {routePlaces.map((place, idx) => {
              const photo = customPhotos[place.id]?.[0] || place.images[0];
              const isFirst = idx === 0;
              const isLast = idx === routePlaces.length - 1;

              return (
                <div
                  key={place.id}
                  className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group"
                >
                  {/* Sequence Number Badge */}
                  <div className="w-8 h-8 rounded-2xl bg-[#e8973a] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                    {idx + 1}
                  </div>

                  {/* Thumbnail Image */}
                  <div
                    onClick={() => onSelectPlace(place)}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-stone-900 shrink-0 cursor-pointer relative"
                  >
                    <img
                      src={photo}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Place Details */}
                  <div
                    onClick={() => onSelectPlace(place)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 uppercase">
                        {place.category}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-[#0e7c66]" />
                        ~{place.estimatedMinutes} {t.minutesUnit}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white truncate mt-0.5">
                      {place.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                        {language === 'en' ? place.bestTimeToVisitEN : place.bestTimeToVisitBM}
                      </p>
                      {onCreateFolderForPlace && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateFolderForPlace(place.id);
                          }}
                          className="shrink-0 text-[10px] font-bold text-[#0e7c66] dark:text-emerald-400 hover:underline flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md cursor-pointer"
                        >
                          <FolderPlus className="w-2.5 h-2.5" />
                          <span>+ Folder Foto</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Controls: Reorder & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Move Up */}
                    <button
                      onClick={() => onMovePlace(idx, idx - 1)}
                      disabled={isFirst}
                      title={t.moveUp}
                      className="w-8 h-8 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => onMovePlace(idx, idx + 1)}
                      disabled={isLast}
                      title={t.moveDown}
                      className="w-8 h-8 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Remove Stop */}
                    <button
                      onClick={() => onRemoveFromRoute(place.id)}
                      title={t.removeStop}
                      className="w-8 h-8 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row: Export as TXT / Print PDF / View on Map / Clear */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {/* View on Map */}
            <button
              onClick={() => onNavigateTab('map')}
              className="flex-1 min-w-[140px] py-2.5 px-3 rounded-2xl bg-[#0e7c66] hover:bg-[#0b6754] text-white text-xs font-bold shadow-sm active:scale-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Lihat Garis di Peta</span>
            </button>

            {/* Export as TXT */}
            <button
              onClick={handleExportTxt}
              className="py-2.5 px-3 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-700 active:scale-95 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#e8973a]" />
              <span>{t.exportTxt}</span>
            </button>

            {/* Share Journey Card */}
            {onOpenShareJourney && (
              <button
                onClick={onOpenShareJourney}
                className="py-2.5 px-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold active:scale-95 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.shareJourneyBtn}</span>
              </button>
            )}

            {/* Print / Save as PDF */}
            <button
              onClick={handlePrintPdf}
              className="py-2.5 px-3 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-700 active:scale-95 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#0e7c66]" />
              <span>{t.printPdf}</span>
            </button>

            {/* Clear All */}
            <button
              onClick={() => {
                if (
                  window.confirm(
                    language === 'en'
                      ? 'Clear all places from your route?'
                      : 'Kosongkan semua tempat dari laluan anda?'
                  )
                ) {
                  onClearRoute();
                }
              }}
              title={t.clearRoute}
              className="py-2.5 px-3 rounded-2xl text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.clearRoute}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
