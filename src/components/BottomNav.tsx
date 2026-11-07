/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavigationTab, Language } from '../types.ts';
import { TRANSLATIONS } from '../utils/translations.ts';
import { Home, Compass, Map, Route, FolderHeart, MessageSquare } from 'lucide-react';

interface Props {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  language: Language;
  itineraryCount: number;
  foldersCount?: number;
}

export const BottomNav: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  language,
  itineraryCount,
  foldersCount = 0,
}) => {
  const t = TRANSLATIONS[language];

  const items = [
    { id: 'home' as NavigationTab, label: t.navHome, icon: Home },
    { id: 'gallery' as NavigationTab, label: t.navGallery, icon: Compass },
    { id: 'map' as NavigationTab, label: t.navMap, icon: Map },
    {
      id: 'itinerary' as NavigationTab,
      label: t.navItinerary,
      icon: Route,
      badge: itineraryCount > 0 ? itineraryCount : undefined,
    },
    {
      id: 'journal' as NavigationTab,
      label: t.navJournal,
      icon: FolderHeart,
      badge: foldersCount > 0 ? foldersCount : undefined,
    },
    {
      id: 'chat' as NavigationTab,
      label: t.navChat,
      icon: MessageSquare,
      highlight: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-lg border-t border-stone-200 dark:border-stone-800 shadow-lg no-print">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 cursor-pointer min-w-[56px] min-h-[48px] active:scale-90 ${
                isActive
                  ? 'text-[#0e7c66] dark:text-emerald-400 font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium'
              }`}
            >
              {/* Highlight pill indicator for active tab */}
              {isActive && (
                <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-150" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                  } ${item.highlight && !isActive ? 'text-[#e8973a]' : ''}`}
                />

                {/* Badge if item has one */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-[#e8973a] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}

                {/* Sparkle indicator for AI assistant */}
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                )}
              </div>

              <span className="text-[11px] mt-0.5 tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
