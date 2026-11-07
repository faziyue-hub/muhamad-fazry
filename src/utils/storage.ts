/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language, ThemeMode, ChatMessage, UserCustomPhotos, PlaceLocation } from '../types.ts';

const KEYS = {
  FAVORITES: 'dias_favorites_v1',
  ROUTE: 'dias_route_v1',
  CUSTOM_PHOTOS: 'dias_custom_photos_v1',
  LANGUAGE: 'dias_lang_v1',
  THEME: 'dias_theme_v1',
  CHAT_HISTORY: 'dias_chat_v1',
};

// Favorites
export function getSavedFavorites(): string[] {
  try {
    const data = localStorage.getItem(KEYS.FAVORITES);
    return data ? JSON.parse(data) : ['pasar-pusat-sibu', 'kedai-kopi-foochow'];
  } catch {
    return ['pasar-pusat-sibu', 'kedai-kopi-foochow'];
  }
}

export function saveFavorites(ids: string[]): void {
  try {
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save favorites to localStorage', e);
  }
}

// Route / Itinerary
export function getSavedRoute(): string[] {
  try {
    const data = localStorage.getItem(KEYS.ROUTE);
    return data ? JSON.parse(data) : ['pasar-pusat-sibu', 'kedai-kopi-foochow', 'kuil-tua-pek-kong', 'tebing-sungai-rejang'];
  } catch {
    return ['pasar-pusat-sibu', 'kedai-kopi-foochow', 'kuil-tua-pek-kong', 'tebing-sungai-rejang'];
  }
}

export function saveRoute(ids: string[]): void {
  try {
    localStorage.setItem(KEYS.ROUTE, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save route to localStorage', e);
  }
}

// Custom Photos uploaded by user
export function getSavedCustomPhotos(): UserCustomPhotos {
  try {
    const data = localStorage.getItem(KEYS.CUSTOM_PHOTOS);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveCustomPhotos(photos: UserCustomPhotos): void {
  try {
    localStorage.setItem(KEYS.CUSTOM_PHOTOS, JSON.stringify(photos));
  } catch (e) {
    console.error('Failed to save custom photos', e);
  }
}

// Language
export function getSavedLanguage(): Language {
  try {
    const lang = localStorage.getItem(KEYS.LANGUAGE) as Language;
    return lang === 'en' ? 'en' : 'ms';
  } catch {
    return 'ms';
  }
}

export function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem(KEYS.LANGUAGE, lang);
  } catch (e) {
    console.error('Failed to save language', e);
  }
}

// Theme
export function getSavedTheme(): ThemeMode {
  try {
    const theme = localStorage.getItem(KEYS.THEME) as ThemeMode;
    return theme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(KEYS.THEME, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

// Chat history
export function getSavedChatHistory(): ChatMessage[] {
  try {
    const data = localStorage.getItem(KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(messages.slice(-30)));
  } catch (e) {
    console.error('Failed to save chat history', e);
  }
}

// Export as plain text file (.txt)
export function exportItineraryAsTxt(places: PlaceLocation[], totalMinutes: number, lang: Language): void {
  const isEn = lang === 'en';
  const hours = (totalMinutes / 60).toFixed(1);

  let content = `========================================\n`;
  content += ` DIAS.AI - JADUAL PERJALANAN SIBU\n`;
  content += ` "My Kampung, My Pride" - Sibu, Sarawak\n`;
  content += `========================================\n\n`;
  content += `${isEn ? 'Total Stops' : 'Jumlah Hentian'}: ${places.length} tempat\n`;
  content += `${isEn ? 'Estimated Total Time' : 'Anggaran Jumlah Masa'}: ~${totalMinutes} minit (~${hours} jam)\n`;
  content += `Tarikh Cetakan: ${new Date().toLocaleDateString()}\n\n`;
  content += `----------------------------------------\n`;
  content += `${isEn ? 'URUTAN LALUAN LAWATAN:' : 'URUTAN LALUAN LAWATAN:'}\n`;
  content += `----------------------------------------\n\n`;

  places.forEach((p, idx) => {
    content += `${idx + 1}. ${p.name}\n`;
    content += `   - Kategori: ${p.category}\n`;
    content += `   - Anggaran Masa: ${p.estimatedMinutes} minit\n`;
    content += `   - Penerangan: ${isEn ? p.descriptionEN : p.descriptionBM}\n`;
    content += `   - Fakta Menarik: ${isEn ? p.interestingFactEN : p.interestingFactBM}\n`;
    content += `   - Waktu Terbaik: ${isEn ? p.bestTimeToVisitEN : p.bestTimeToVisitBM}\n`;
    content += `   - Tip Tempatan: ${isEn ? p.localTipsEN : p.localTipsBM}\n`;
    if (p.address) content += `   - Alamat: ${p.address}\n`;
    content += `\n`;
  });

  content += `========================================\n`;
  content += `Peringatan Keselamatan: Waktu operasi peniaga atau jadual bot mungkin berubah mengikut musim. Sila sahkan sebelum pergi.\n`;
  content += `Dias.Ai - Pemandu Pelancongan Pintar Sibu\n`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `DiasAi_Laluan_Sibu_${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Print / PDF export
export function printItineraryDocument(): void {
  window.print();
}
