/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlaceLocation, PlaceCategory, Language, AiItineraryResult } from '../types.ts';
import { TRANSLATIONS } from '../utils/translations.ts';
import {
  X,
  Sparkles,
  Clock,
  Wallet,
  Heart,
  CheckCircle2,
  ArrowRight,
  Route,
  Loader2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  places: PlaceLocation[];
  language: Language;
  onApplyRoute: (placeIds: string[]) => void;
}

export const AiItineraryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  places,
  language,
  onApplyRoute,
}) => {
  const t = TRANSLATIONS[language];

  const [hours, setHours] = useState<number>(4);
  const [budget, setBudget] = useState<'rendah' | 'sederhana' | 'bebas'>('sederhana');
  const [selectedInterests, setSelectedInterests] = useState<PlaceCategory[]>([
    'Makanan',
    'Budaya',
  ]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<AiItineraryResult | null>(null);

  if (!isOpen) return null;

  const interestOptions: PlaceCategory[] = ['Makanan', 'Budaya', 'Alam', 'Kampung'];

  const toggleInterest = (cat: PlaceCategory) => {
    setSelectedInterests((prev) =>
      prev.includes(cat)
        ? prev.length > 1
          ? prev.filter((c) => c !== cat)
          : prev
        : [...prev, cat]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hours,
          budget,
          interests: selectedInterests,
          lang: language,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi pelayan penjana laluan');
      }

      const data: AiItineraryResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error generating itinerary:', err);
      // Fallback generation locally
      const filtered = places.filter((p) => selectedInterests.includes(p.category));
      const pool = filtered.length >= 3 ? filtered : places;
      const count = Math.min(5, Math.max(3, Math.round(hours / 1.5)));
      const chosen = pool.slice(0, count);

      setResult({
        title: language === 'en' ? `Sibu ${hours}-Hour Curated Tour` : `Laluan Terpilih Sibu ${hours} Jam`,
        summary: language === 'en'
          ? `A sequence of ${chosen.length} highlights matching your taste for ${selectedInterests.join(', ')}.`
          : `Laluan santai ${chosen.length} lokasi terbaik menepati minat ${selectedInterests.join(', ')}.`,
        placeIds: chosen.map((c) => c.id),
        totalEstimatedMinutes: chosen.reduce((acc, c) => acc + c.estimatedMinutes + 15, 0),
        routeTips: [
          'Mulakan perjalanan lebih awal untuk menikmati sarapan pasar.',
          'Bawa payung lipat dan air minuman secukupnya.',
        ],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (result && result.placeIds.length > 0) {
      onApplyRoute(result.placeIds);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-xl max-h-[90vh] bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800 transition-colors animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#0e7c66] to-[#e8973a] text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                {t.aiModalTitle}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {t.aiModalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form & Results */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. Time / Duration input */}
          <div>
            <label className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Clock className="w-4 h-4 text-[#0e7c66]" />
              {t.durationLabel}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 4, 6, 8].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHours(h)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    hours === h
                      ? 'bg-[#0e7c66] text-white shadow-md shadow-[#0e7c66]/20'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {h} {t.hoursUnit}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Budget Level */}
          <div>
            <label className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Wallet className="w-4 h-4 text-[#e8973a]" />
              {t.budgetLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rendah' as const, label: t.budgetLow },
                { id: 'sederhana' as const, label: t.budgetMedium },
                { id: 'bebas' as const, label: t.budgetFree },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudget(b.id)}
                  className={`py-2 px-2.5 rounded-2xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                    budget === b.id
                      ? 'bg-[#e8973a] text-white shadow-md'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Interests (Multi-select) */}
          <div>
            <label className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Heart className="w-4 h-4 text-rose-500" />
              {t.interestsLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {interestOptions.map((cat) => {
                const isSelected = selectedInterests.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleInterest(cat)}
                    className={`py-2.5 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-2 border-[#0e7c66] text-[#0e7c66] dark:text-emerald-300'
                        : 'bg-stone-100 dark:bg-stone-800 border-2 border-transparent text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0e7c66]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0e7c66] to-[#0b6754] hover:opacity-95 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.btnGenerating}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{t.btnGenerate}</span>
              </>
            )}
          </button>

          {/* Generated Result Preview */}
          {result && (
            <div className="mt-4 p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#e8973a] uppercase tracking-wider">
                  {t.routeGeneratedSuccess}
                </span>
                <span className="text-xs font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#0e7c66]" />
                  ~{result.totalEstimatedMinutes} {t.minutesUnit}
                </span>
              </div>

              <h4 className="text-base font-black text-stone-900 dark:text-white">
                {result.title}
              </h4>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                {result.summary}
              </p>

              {/* Selected Places Sequence */}
              <div className="space-y-2 pt-1">
                {result.placeIds.map((id, index) => {
                  const place = places.find((p) => p.id === id);
                  if (!place) return null;
                  return (
                    <div
                      key={id}
                      className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-2.5 text-xs font-semibold"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#0e7c66] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-stone-900 dark:text-white truncate">
                        {place.name}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        ~{place.estimatedMinutes}m
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Route tips */}
              {result.routeTips && result.routeTips.length > 0 && (
                <div className="text-[11px] text-stone-600 dark:text-stone-400 space-y-1 pt-1">
                  {result.routeTips.map((tip, idx) => (
                    <p key={idx}>💡 {tip}</p>
                  ))}
                </div>
              )}

              {/* Apply Route Button */}
              <button
                onClick={handleApply}
                className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#e8973a] hover:bg-[#d28227] text-white font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Route className="w-4 h-4" />
                <span>{t.btnApplyRoute}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
