/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, ThemeMode } from '../types.ts';
import { TRANSLATIONS } from '../utils/translations.ts';
import { Moon, Sun, Sparkles, MapPin } from 'lucide-react';

interface Props {
  language: Language;
  onToggleLanguage: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenAiPlanner: () => void;
  isOnline: boolean;
}

export const HeaderNav: React.FC<Props> = ({
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  onOpenAiPlanner,
  isOnline,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0e7c66] to-[#e8973a] flex items-center justify-center text-white shadow-md shadow-[#0e7c66]/20">
            <span className="font-extrabold text-lg tracking-wider">D</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-stone-900 dark:text-white">
                Dias<span className="text-[#e8973a]">.Ai</span>
              </span>
              <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0e7c66] dark:text-emerald-400">
                <MapPin className="w-2.5 h-2.5 mr-0.5" />
                Sibu
              </span>
            </div>
            <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 leading-none">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick AI Planner Button */}
          <button
            onClick={onOpenAiPlanner}
            aria-label="Jana Laluan AI"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#0e7c66] to-[#0b6754] text-white shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">{t.quickPlan}</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Bilingual Switcher */}
          <button
            onClick={onToggleLanguage}
            title={t.toggleLanguage}
            className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'ms' ? '🇲🇾 BM' : '🇬🇧 EN'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            title={t.toggleTheme}
            className="w-9 h-9 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
          </button>
        </div>
      </div>

      {/* Offline Status Banner if disconnected */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-[11px] py-1 text-center font-medium px-4">
          {t.offlineNotice}
        </div>
      )}
    </header>
  );
};
