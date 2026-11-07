/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { DestinationFolder, PlaceLocation, Language } from '../types.ts';
import { TRANSLATIONS } from '../utils/translations.ts';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  MapPin,
  Camera,
  Calendar,
  Layers,
  Heart,
  Palette,
  Loader2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  folders: DestinationFolder[];
  places: PlaceLocation[];
  language: Language;
  preselectedFolderId?: string | null;
}

type CardTheme = 'emerald' | 'sunset' | 'dark';

export const ShareJourneyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  folders,
  places,
  language,
  preselectedFolderId,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    preselectedFolderId || (folders.length > 0 ? folders[0].id : 'all')
  );
  const [cardTheme, setCardTheme] = useState<CardTheme>('emerald');
  const [customTitle, setCustomTitle] = useState<string>(
    language === 'en' ? 'My Sibu Adventure' : 'Pengembaraan Sibu Saya'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Target folders to include
  const activeFolders =
    selectedFolderId === 'all'
      ? folders
      : folders.filter((f) => f.id === selectedFolderId);

  // Aggregate stats
  const totalPhotos = activeFolders.reduce((sum, f) => sum + f.photos.length, 0);
  const visitedPlaceIds = Array.from(new Set(activeFolders.map((f) => f.placeId)));
  const visitedPlaceNames = visitedPlaceIds
    .map((id) => {
      const pl = places.find((p) => p.id === id);
      return pl ? pl.name.split('(')[0].trim() : '';
    })
    .filter(Boolean);

  // Extract up to 4 preview photos
  const previewPhotos: string[] = [];
  activeFolders.forEach((f) => {
    f.photos.forEach((p) => {
      if (previewPhotos.length < 4 && p.dataUrl) {
        previewPhotos.push(p.dataUrl);
      }
    });
  });

  // If user has no custom photos in folders yet, fallback to place images
  if (previewPhotos.length === 0) {
    visitedPlaceIds.forEach((id) => {
      const pl = places.find((p) => p.id === id);
      if (pl && pl.images.length > 0 && previewPhotos.length < 4) {
        previewPhotos.push(pl.images[0]);
      }
    });
  }

  // Selected folder notes or snippet
  const notesSnippet =
    activeFolders.find((f) => f.notes)?.notes ||
    (language === 'en'
      ? 'Exploring the cultural soul, heritage, and flavors of Sibu, Sarawak.'
      : 'Meneroka keindahan warisan, sungai dan keenakan kulinari Sibu, Sarawak.');

  // Theme styles
  const getThemeGradient = () => {
    switch (cardTheme) {
      case 'sunset':
        return 'from-[#7c2d12] via-[#c2410c] to-[#e8973a] text-white';
      case 'dark':
        return 'from-stone-950 via-stone-900 to-stone-850 text-stone-100 border border-emerald-500/30';
      case 'emerald':
      default:
        return 'from-[#08483b] via-[#0e7c66] to-[#149b80] text-white';
    }
  };

  // Helper to load image for canvas
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load ${src}`));
      img.src = src;
    });
  };

  // Canvas Generation and Export to PNG
  const handleDownloadPng = async () => {
    setIsGenerating(true);
    try {
      const width = 1080;
      const height = 1350; // 4:5 Instagram Portrait Ratio
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Background Gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (cardTheme === 'sunset') {
        grad.addColorStop(0, '#7c2d12');
        grad.addColorStop(0.5, '#c2410c');
        grad.addColorStop(1, '#e8973a');
      } else if (cardTheme === 'dark') {
        grad.addColorStop(0, '#0c0a09');
        grad.addColorStop(0.6, '#1c1917');
        grad.addColorStop(1, '#292524');
      } else {
        grad.addColorStop(0, '#063a2f');
        grad.addColorStop(0.5, '#0e7c66');
        grad.addColorStop(1, '#118a72');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle Decorative Pattern Overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let i = 0; i < width; i += 60) {
        ctx.fillRect(i, 0, 1.5, height);
      }

      // 2. Top Header Brand Pill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(80, 70, 360, 48, 24);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('DIAS.AI • MY KAMPUNG, MY PRIDE', 105, 102);

      // Sibu Sarawak Tag
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.textAlign = 'right';
      ctx.fillText('SIBU, SARAWAK 🌿', width - 80, 102);
      ctx.textAlign = 'left';

      // 3. Main Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(customTitle || 'Pengembaraan Sibu Saya', 80, 185);

      // Visited date or subtitle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const dateText =
        activeFolders.length === 1 && activeFolders[0].visitedDate
          ? `Tarikh Lawatan: ${activeFolders[0].visitedDate}`
          : `Diari Pengembaraan Tempatan`;
      ctx.fillText(dateText, 80, 225);

      // 4. Metrics Cards (3 Pillars)
      const statCardWidth = 280;
      const statCardHeight = 110;
      const statY = 265;
      const statSpacing = 28;
      const stats = [
        { label: t.tripStatsPlaces, val: visitedPlaceNames.length || activeFolders.length },
        { label: t.tripStatsPhotos, val: totalPhotos || previewPhotos.length },
        { label: t.tripStatsMemories, val: activeFolders.length },
      ];

      stats.forEach((st, idx) => {
        const x = 80 + idx * (statCardWidth + statSpacing);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath();
        ctx.roundRect(x, statY, statCardWidth, statCardHeight, 20);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(st.label.toUpperCase(), x + 24, statY + 38);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(String(st.val), x + 24, statY + 86);
      });

      // 5. Photo Grid (Magazine Layout)
      const photoBoxY = 415;
      const photoBoxW = width - 160;
      const photoBoxH = 510;

      // Draw background container for photos
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.roundRect(80, photoBoxY, photoBoxW, photoBoxH, 28);
      ctx.fill();

      if (previewPhotos.length > 0) {
        try {
          const loadedImgs = await Promise.all(
            previewPhotos.slice(0, 4).map((src) => loadImage(src).catch(() => null))
          );
          const validImgs = loadedImgs.filter((img): img is HTMLImageElement => img !== null);

          if (validImgs.length === 1) {
            // Single large photo
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(80, photoBoxY, photoBoxW, photoBoxH, 28);
            ctx.clip();
            ctx.drawImage(validImgs[0], 80, photoBoxY, photoBoxW, photoBoxH);
            ctx.restore();
          } else if (validImgs.length === 2) {
            // 2 split photos
            const halfW = (photoBoxW - 14) / 2;
            [0, 1].forEach((idx) => {
              const x = 80 + idx * (halfW + 14);
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(x, photoBoxY, halfW, photoBoxH, 24);
              ctx.clip();
              ctx.drawImage(validImgs[idx], x, photoBoxY, halfW, photoBoxH);
              ctx.restore();
            });
          } else {
            // 3 or 4 grid photos
            const halfW = (photoBoxW - 14) / 2;
            const halfH = (photoBoxH - 14) / 2;
            validImgs.slice(0, 4).forEach((img, idx) => {
              const col = idx % 2;
              const row = Math.floor(idx / 2);
              const x = 80 + col * (halfW + 14);
              const y = photoBoxY + row * (halfH + 14);
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(x, y, halfW, halfH, 20);
              ctx.clip();
              ctx.drawImage(img, x, y, halfW, halfH);
              ctx.restore();
            });
          }
        } catch (err) {
          console.warn('Canvas image draw error:', err);
        }
      }

      // 6. Visited Destinations Badges
      let chipX = 80;
      const chipY = 960;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('📍 DESTINASI DILAWATI:', 80, chipY - 14);

      const displayChips = visitedPlaceNames.slice(0, 4);
      displayChips.forEach((name) => {
        ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const textWidth = ctx.measureText(name).width;
        const pillW = textWidth + 36;
        const pillH = 40;

        if (chipX + pillW > width - 80) return;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(chipX, chipY, pillW, pillH, 20);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(name, chipX + 18, chipY + 26);
        chipX += pillW + 12;
      });

      // 7. Traveler Note / Quote
      const quoteY = 1045;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(80, quoteY, photoBoxW, 140, 24);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'italic 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      // Truncate note if long
      const cleanNote = notesSnippet.length > 130 ? `${notesSnippet.slice(0, 130)}...` : notesSnippet;
      ctx.fillText(`“${cleanNote}”`, 110, quoteY + 60);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('— Catatan Pengembara Dias.Ai Sibu', 110, quoteY + 105);

      // 8. Footer Brand Signature
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Dihasilkan dengan Dias.Ai • Pemandu Pelancongan Pintar Sibu', 80, height - 70);

      ctx.textAlign = 'right';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('#MyKampungMyPride #SibuSarawak', width - 80, height - 70);
      ctx.textAlign = 'left';

      // Download file
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `DiasAi_Sibu_Pengembaraan_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error generating card image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Native Web Share API
  const handleShareNative = async () => {
    const textSummary = `🌿 ${customTitle}\n` +
      `📍 ${visitedPlaceNames.join(', ')}\n` +
      `📸 ${totalPhotos} Foto & Kenangan di Sibu, Sarawak!\n` +
      `💬 "${notesSnippet}"\n` +
      `Diteroka dengan Dias.Ai (My Kampung, My Pride) #Sibu #Sarawak #DiasAi`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: customTitle,
          text: textSummary,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      // Fallback copy to clipboard
      handleCopyText();
    }
  };

  // Copy text to clipboard
  const handleCopyText = async () => {
    const textSummary = `🌿 ${customTitle}\n` +
      `📍 Destinasi Dilawati: ${visitedPlaceNames.join(', ')}\n` +
      `📸 Foto Kenangan: ${totalPhotos} keping\n` +
      `💬 Catatan: "${notesSnippet}"\n` +
      `✨ Terokai Sibu dengan Dias.Ai (My Kampung, My Pride) #Sibu #Sarawak #MyKampungMyPride`;

    try {
      await navigator.clipboard.writeText(textSummary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[92vh] bg-white dark:bg-stone-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800 animate-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-[#0e7c66] dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                <span>{t.shareJourneyTitle}</span>
                <Sparkles className="w-4 h-4 text-[#e8973a]" />
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t.shareJourneySubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body & Interactive Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Controls: Select Album & Card Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700/70">
            {/* Scope Selector */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                Pilih Kandungan Kad
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full py-2 px-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0e7c66]"
              >
                <option value="all">🌟 {t.shareAllFolders} ({folders.length} Folder)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.folderName} ({f.photos.length} foto)
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Selector */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                {t.cardThemeLabel}
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCardTheme('emerald')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    cardTheme === 'emerald'
                      ? 'bg-[#0e7c66] text-white border-[#0e7c66] shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  🌿 {t.cardThemeEmerald}
                </button>
                <button
                  type="button"
                  onClick={() => setCardTheme('sunset')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    cardTheme === 'sunset'
                      ? 'bg-[#e8973a] text-white border-[#e8973a] shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  🌅 {t.cardThemeSunset}
                </button>
                <button
                  type="button"
                  onClick={() => setCardTheme('dark')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    cardTheme === 'dark'
                      ? 'bg-stone-900 text-emerald-400 border-emerald-500 shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  🌑 {t.cardThemeDark}
                </button>
              </div>
            </div>
          </div>

          {/* Editable Title */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
              Tajuk Kad Perjalanan
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={t.shareStoryCardTitle}
              className="w-full py-2 px-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e7c66]"
            />
          </div>

          {/* Visual Card Live Preview */}
          <div className="relative group">
            <div
              className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-br shadow-xl transition-all duration-300 space-y-4 ${getThemeGradient()}`}
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                  <span className="text-[11px] font-extrabold tracking-wider uppercase text-white/90">
                    Dias.Ai • My Kampung, My Pride
                  </span>
                </div>
                <span className="text-[11px] font-bold text-white/80">
                  Sibu, Sarawak 🌿
                </span>
              </div>

              {/* Main Title & Subtitle */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {customTitle || 'Pengembaraan Sibu Saya'}
                </h2>
                <p className="text-xs text-white/85 mt-1 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {activeFolders.length === 1 && activeFolders[0].visitedDate
                      ? activeFolders[0].visitedDate
                      : 'Koleksi Memori & Destinasi Sibu'}
                  </span>
                </p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 py-1">
                <div className="bg-white/15 backdrop-blur-md p-2.5 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-white/70 block">
                    {t.tripStatsPlaces}
                  </span>
                  <span className="text-lg font-black text-white">
                    {visitedPlaceNames.length || activeFolders.length}
                  </span>
                </div>
                <div className="bg-white/15 backdrop-blur-md p-2.5 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-white/70 block">
                    {t.tripStatsPhotos}
                  </span>
                  <span className="text-lg font-black text-amber-300">
                    {totalPhotos || previewPhotos.length}
                  </span>
                </div>
                <div className="bg-white/15 backdrop-blur-md p-2.5 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-white/70 block">
                    {t.tripStatsMemories}
                  </span>
                  <span className="text-lg font-black text-white">
                    {activeFolders.length}
                  </span>
                </div>
              </div>

              {/* Photo Collage Preview */}
              {previewPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden bg-black/25 p-1.5">
                  {previewPhotos.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-800 ${
                        previewPhotos.length === 1 ? 'col-span-2 aspect-[16/9]' : ''
                      }`}
                    >
                      <img
                        src={img}
                        alt="Kenangan"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                  <Camera className="w-8 h-8 text-white/70 mx-auto mb-2" />
                  <p className="text-xs text-white/90 font-bold">
                    {t.shareEmptyNotice}
                  </p>
                </div>
              )}

              {/* Visited Destinations Badges */}
              {visitedPlaceNames.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {visitedPlaceNames.slice(0, 4).map((name, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-amber-300" />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Story Quote */}
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
                <p className="text-xs italic text-white/95 leading-relaxed">
                  💬 “{notesSnippet}”
                </p>
              </div>

              {/* Card Footer Tag */}
              <div className="flex items-center justify-between text-[10px] text-white/70 font-semibold pt-1 border-t border-white/15">
                <span>Dihasilkan dengan Dias.Ai</span>
                <span>#MyKampungMyPride</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-between gap-2.5 flex-wrap">
          {/* Copy Text Summary */}
          <button
            onClick={handleCopyText}
            className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-750 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {copySuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 dark:text-emerald-400">
                  {t.copiedToast}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-500" />
                <span>{t.copySummaryBtn}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {/* Native Share button */}
            <button
              onClick={handleShareNative}
              className="px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>{t.shareSocialBtn}</span>
            </button>

            {/* Download PNG Button */}
            <button
              onClick={handleDownloadPng}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0e7c66] to-[#0b6754] hover:opacity-95 text-white text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menjana Gambar...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{t.downloadPngBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
