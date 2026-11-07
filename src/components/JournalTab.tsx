/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { DestinationFolder, FolderPhoto, PlaceLocation, Language } from '../types.ts';
import { TRANSLATIONS } from '../utils/translations.ts';
import { compressImageFile } from '../utils/photoJournalDb.ts';
import {
  FolderPlus,
  Folder,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Trash2,
  Upload,
  ArrowLeft,
  X,
  Plus,
  Download,
  Loader2,
  Camera,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Check,
  MessageSquare,
  Sparkles,
  Share2,
} from 'lucide-react';

interface Props {
  folders: DestinationFolder[];
  places: PlaceLocation[];
  language: Language;
  onOpenCreateModal: () => void;
  onDeleteFolder: (folderId: string) => void;
  onAddPhotosToFolder: (folderId: string, photos: FolderPhoto[]) => void;
  onDeletePhotoFromFolder: (folderId: string, photoId: string) => void;
  onUpdatePhotoStory: (folderId: string, photoId: string, story: string) => void;
  onOpenShareJourney?: (folderId?: string) => void;
}

export const JournalTab: React.FC<Props> = ({
  folders,
  places,
  language,
  onOpenCreateModal,
  onDeleteFolder,
  onAddPhotosToFolder,
  onDeletePhotoFromFolder,
  onUpdatePhotoStory,
  onOpenShareJourney,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [filterPlaceId, setFilterPlaceId] = useState<string>('all');
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number | null>(null);
  const [isUploadingMore, setIsUploadingMore] = useState(false);

  // Auto transition slideshow states
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState<boolean>(true);
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);

  // Editing story state (in grid or lightbox)
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editingStoryText, setEditingStoryText] = useState<string>('');

  const activeFolder = folders.find((f) => f.id === selectedFolderId);

  // Reset slide index when opening a folder
  useEffect(() => {
    setHeroSlideIndex(0);
    setIsSlideshowPlaying(true);
  }, [selectedFolderId]);

  // Auto Transition Effect for Active Folder Hero Slideshow
  useEffect(() => {
    if (!activeFolder || activeFolder.photos.length <= 1 || !isSlideshowPlaying) {
      return;
    }

    const timer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % activeFolder.photos.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [activeFolder, isSlideshowPlaying]);

  // Auto Transition Effect inside Lightbox (when slideshow is active)
  useEffect(() => {
    if (!activeFolder || lightboxPhotoIndex === null || activeFolder.photos.length <= 1 || !isSlideshowPlaying) {
      return;
    }

    const timer = setInterval(() => {
      setLightboxPhotoIndex((prev) =>
        prev !== null ? (prev + 1) % activeFolder.photos.length : null
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [activeFolder, lightboxPhotoIndex, isSlideshowPlaying]);

  // Folder overview cards auto cycle state
  const [cardPhotoIndexes, setCardPhotoIndexes] = useState<{ [folderId: string]: number }>({});
  useEffect(() => {
    const timer = setInterval(() => {
      setCardPhotoIndexes((prev) => {
        const next: { [folderId: string]: number } = { ...prev };
        folders.forEach((f) => {
          if (f.photos.length > 1) {
            const current = next[f.id] || 0;
            next[f.id] = (current + 1) % f.photos.length;
          }
        });
        return next;
      });
    }, 3800);
    return () => clearInterval(timer);
  }, [folders]);

  // Upload more photos to active folder
  const handleUploadMoreToFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFolderId || !e.target.files) return;
    const files = e.target.files;
    if (files.length === 0) return;

    setIsUploadingMore(true);
    try {
      const newPhotos: FolderPhoto[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await compressImageFile(file, 1280, 0.82);
        newPhotos.push({
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          dataUrl,
          story: '',
          caption: '',
          uploadedAt: Date.now(),
        });
      }
      onAddPhotosToFolder(selectedFolderId, newPhotos);
    } catch (err) {
      console.error('Error adding photos:', err);
    } finally {
      setIsUploadingMore(false);
    }
  };

  const handleStartEditStory = (photo: FolderPhoto) => {
    setEditingPhotoId(photo.id);
    setEditingStoryText(photo.story || photo.caption || '');
  };

  const handleSaveStory = (folderId: string, photoId: string) => {
    onUpdatePhotoStory(folderId, photoId, editingStoryText.trim());
    setEditingPhotoId(null);
  };

  const handleDownloadPhoto = (photo: FolderPhoto) => {
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = `DiasAi_Sibu_${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Total stats
  const totalPhotosCount = folders.reduce((sum, f) => sum + f.photos.length, 0);
  const visitedPlaceIds = new Set(folders.map((f) => f.placeId));

  const filteredFolders = folders.filter((f) =>
    filterPlaceId === 'all' ? true : f.placeId === filterPlaceId
  );

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 pt-3">
      {/* If a folder is opened, show Folder Detail View */}
      {activeFolder ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Back button & Folder Title */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setSelectedFolderId(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#0e7c66] dark:text-emerald-400 hover:underline cursor-pointer py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Senarai Folder</span>
            </button>

            <div className="flex items-center gap-2">
              {onOpenShareJourney && (
                <button
                  onClick={() => onOpenShareJourney(activeFolder.id)}
                  className="px-3 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t.shareSingleFolder}</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (window.confirm(t.deleteFolderConfirm)) {
                    onDeleteFolder(activeFolder.id);
                    setSelectedFolderId(null);
                  }
                }}
                className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Padam Folder</span>
              </button>
            </div>
          </div>

          {/* Folder Details Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0e7c66] dark:text-emerald-300 text-xs font-extrabold flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {activeFolder.placeName}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#e8973a]" />
                  {activeFolder.visitedDate}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {activeFolder.photos.length} {t.photosCount}
                </span>
              </div>

              {/* Auto Slideshow Toggle Button */}
              {activeFolder.photos.length > 1 && (
                <button
                  onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                    isSlideshowPlaying
                      ? 'bg-[#0e7c66] text-white shadow-[#0e7c66]/20'
                      : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {isSlideshowPlaying ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span>{t.pauseSlideshow}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping ml-0.5" />
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>{t.playSlideshow}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
              {activeFolder.folderName}
            </h3>

            {activeFolder.notes && (
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-900/60 p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
                💬 {activeFolder.notes}
              </p>
            )}

            {/* HERO AUTO-TRANSITION SLIDESHOW BANNER (when > 1 photo) */}
            {activeFolder.photos.length > 0 && (
              <div className="relative rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[21/10] bg-stone-950 shadow-md group">
                {activeFolder.photos.map((photo, idx) => {
                  const isActive = idx === heroSlideIndex;
                  return (
                    <div
                      key={photo.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <img
                        src={photo.dataUrl}
                        alt="Foto Kenangan"
                        className="w-full h-full object-cover transition-transform duration-1000 scale-100 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                      {/* Story Text Overlay on each picture ("tempat text supaya dpt menceritakan apa yg terjadi") */}
                      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20">
                        <div className="p-3 sm:p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-white space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {t.photoStoryTitle} ({idx + 1}/{activeFolder.photos.length})
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditStory(photo);
                              }}
                              className="text-[10px] text-white/90 hover:text-white underline flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{photo.story ? t.editPhotoStory : t.addPhotoStory}</span>
                            </button>
                          </div>

                          <p className="text-xs sm:text-sm text-stone-100 font-medium leading-relaxed italic">
                            {photo.story
                              ? `"${photo.story}"`
                              : language === 'en'
                              ? 'No story added for this moment yet. Click Edit Story to write what happened!'
                              : 'Belum ada cerita untuk momen ini. Tekan "Tulis Cerita" untuk menceritakan apa yang terjadi pada masa itu!'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Left/Right manual click triggers */}
                {activeFolder.photos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setHeroSlideIndex(
                          (prev) => (prev - 1 + activeFolder.photos.length) % activeFolder.photos.length
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-sm transition-all"
                      aria-label="Foto Sebelumnya"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setHeroSlideIndex((prev) => (prev + 1) % activeFolder.photos.length)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-sm transition-all"
                      aria-label="Foto Seterusnya"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Navigation Dots */}
                    <div className="absolute top-3 left-0 right-0 flex items-center justify-center gap-1.5 z-30">
                      {activeFolder.photos.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setHeroSlideIndex(dotIdx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            heroSlideIndex === dotIdx
                              ? 'w-6 bg-amber-400'
                              : 'w-2 bg-white/60 hover:bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Quick Upload Button */}
            <div className="pt-2">
              <label className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#0e7c66] to-[#0b6754] text-white text-xs font-extrabold hover:opacity-95 active:scale-95 transition-all shadow-sm cursor-pointer">
                {isUploadingMore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses gambar...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{t.addMorePhotos}</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingMore}
                  onChange={handleUploadMoreToFolder}
                />
              </label>
            </div>
          </div>

          {/* Photos Grid with Individual Story and Text Box for Each Photo */}
          {activeFolder.photos.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-stone-800 rounded-3xl p-6 border border-stone-200 dark:border-stone-700">
              <Camera className="w-10 h-10 text-stone-400 mx-auto mb-2" />
              <p className="text-stone-600 dark:text-stone-300 text-sm font-bold">
                Folder ini belum mempunyai gambar.
              </p>
              <p className="text-stone-400 text-xs mt-1">
                Tekan butang "+ Tambah Foto Lagi" untuk memuat naik gambar kenangan anda di destinasi ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#0e7c66]" />
                  <span>Koleksi Foto & Cerita Kenangan ({activeFolder.photos.length})</span>
                </h4>
                <span className="text-[11px] text-stone-400">
                  {t.cycleInterval}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {activeFolder.photos.map((photo, pIdx) => {
                  const isEditingThisPhoto = editingPhotoId === photo.id;

                  return (
                    <div
                      key={photo.id}
                      className="group bg-white dark:bg-stone-800/90 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-700/80 shadow-xs hover:shadow-md transition-all flex flex-col"
                    >
                      {/* Photo Thumbnail */}
                      <div
                        onClick={() => setLightboxPhotoIndex(pIdx)}
                        className="relative aspect-[4/3] overflow-hidden bg-stone-900 cursor-pointer"
                      >
                        <img
                          src={photo.dataUrl}
                          alt="Foto Kenangan"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                        {/* Photo Sequence Badge */}
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-md">
                          #{pIdx + 1}
                        </span>

                        {/* Delete photo shortcut */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Padam foto ini dari folder?')) {
                              onDeletePhotoFromFolder(activeFolder.id, photo.id);
                            }
                          }}
                          title="Padam foto"
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Dedicated Story / Caption Box for this photo ("tempat text supaya dpt menceritakan apa yg terjadi pada masa itu") */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                        {isEditingThisPhoto ? (
                          <div className="space-y-2 animate-in fade-in duration-150">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#0e7c66] flex items-center gap-1">
                              <Edit3 className="w-3 h-3" />
                              {t.photoStoryTitle}
                            </label>
                            <textarea
                              rows={3}
                              autoFocus
                              value={editingStoryText}
                              onChange={(e) => setEditingStoryText(e.target.value)}
                              placeholder={t.storyPlaceholder}
                              className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e7c66]"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setEditingPhotoId(null)}
                                className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-semibold cursor-pointer"
                              >
                                {t.cancelStory}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveStory(activeFolder.id, photo.id)}
                                className="px-3 py-1 bg-[#0e7c66] hover:bg-[#0b6754] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>{t.saveStory}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-bold text-stone-400">
                                <span className="flex items-center gap-1 text-[#e8973a]">
                                  <MessageSquare className="w-3 h-3" />
                                  {t.photoStoryTitle}
                                </span>
                                <button
                                  onClick={() => handleStartEditStory(photo)}
                                  className="text-[11px] text-[#0e7c66] dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>{photo.story ? t.editPhotoStory : t.addPhotoStory}</span>
                                </button>
                              </div>

                              {photo.story ? (
                                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed italic bg-stone-50 dark:bg-stone-900/60 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
                                  "{photo.story}"
                                </p>
                              ) : (
                                <button
                                  onClick={() => handleStartEditStory(photo)}
                                  className="w-full text-left p-2.5 rounded-xl border border-dashed border-stone-200 dark:border-stone-700 text-stone-400 text-xs italic hover:border-[#0e7c66] hover:text-[#0e7c66] transition-colors cursor-pointer"
                                >
                                  + {t.addPhotoStory}
                                </button>
                              )}
                            </div>

                            <div className="pt-2 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between text-[11px]">
                              <span className="text-stone-400">
                                {new Date(photo.uploadedAt).toLocaleDateString()}
                              </span>
                              <button
                                onClick={() => setLightboxPhotoIndex(pIdx)}
                                className="font-bold text-[#0e7c66] dark:text-emerald-400 hover:underline cursor-pointer"
                              >
                                {t.lightboxView}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Folder Overview List View */
        <div className="space-y-5">
          {/* Header & Stats Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                <Folder className="w-5 h-5 text-[#0e7c66]" />
                {t.journalTitle}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                {t.journalSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onOpenShareJourney && (
                <button
                  onClick={() => onOpenShareJourney('all')}
                  className="px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md hover:opacity-95 active:scale-95 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{t.shareJourneyBtn}</span>
                </button>
              )}

              <button
                onClick={onOpenCreateModal}
                className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0e7c66] to-[#0b6754] text-white text-xs font-bold shadow-md hover:opacity-95 active:scale-95 flex items-center gap-2 transition-all cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-amber-300" />
                <span>{t.createFolder}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 shadow-xs text-center">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Jumlah Folder
              </span>
              <span className="text-lg sm:text-xl font-black text-[#0e7c66] dark:text-emerald-400">
                {folders.length}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 shadow-xs text-center">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Foto Disimpan
              </span>
              <span className="text-lg sm:text-xl font-black text-[#e8973a]">
                {totalPhotosCount}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 shadow-xs text-center">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Destinasi Dilalui
              </span>
              <span className="text-lg sm:text-xl font-black text-stone-800 dark:text-stone-200">
                {visitedPlaceIds.size}
              </span>
            </div>
          </div>

          {/* Filter by destination if folders exist */}
          {folders.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setFilterPlaceId('all')}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                  filterPlaceId === 'all'
                    ? 'bg-[#0e7c66] text-white shadow-sm'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                }`}
              >
                {t.allDestinations}
              </button>

              {Array.from(visitedPlaceIds).map((pId) => {
                const place = places.find((p) => p.id === pId);
                const name = place ? place.name.split('(')[0].trim() : 'Destinasi';
                return (
                  <button
                    key={pId}
                    onClick={() => setFilterPlaceId(pId)}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                      filterPlaceId === pId
                        ? 'bg-[#e8973a] text-white shadow-sm'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Folders Cards Grid with Auto-Cycling Photos */}
          {filteredFolders.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200 dark:border-stone-700/80 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 text-[#e8973a] flex items-center justify-center mx-auto shadow-inner">
                <FolderPlus className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-black text-stone-900 dark:text-white">
                  {t.noFoldersYet}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  Setiap kali anda melawat atau melalui tempat menarik di Sibu, cipta folder khas (contoh: "Sarapan Kompia", "Lawatan Kuil Tua Pek Kong") dan muat naik foto kenangan anda di sini!
                </p>
              </div>
              <div>
                <button
                  onClick={onOpenCreateModal}
                  className="px-5 py-2.5 rounded-2xl bg-[#0e7c66] text-white text-xs font-extrabold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4 text-amber-300" />
                  <span>{t.createFolder}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFolders.map((folder) => {
                // Auto transition cover for folders with > 1 photo
                const currentIdx = cardPhotoIndexes[folder.id] || 0;
                const activePhoto = folder.photos[currentIdx] || folder.photos[0];
                const coverPhoto = activePhoto?.dataUrl;
                const matchedPlace = places.find((p) => p.id === folder.placeId);
                const fallbackImg = matchedPlace?.images[0];

                return (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className="group bg-white dark:bg-stone-800/90 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-700/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col active:scale-98"
                  >
                    {/* Folder Cover with Smooth Auto Fade */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                      {coverPhoto || fallbackImg ? (
                        <img
                          src={coverPhoto || fallbackImg}
                          alt={folder.folderName}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-400">
                          <Folder className="w-10 h-10 text-[#0e7c66]" />
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                      {/* Photo count badge */}
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold backdrop-blur-md flex items-center gap-1 shadow-sm">
                        <ImageIcon className="w-3 h-3 text-[#e8973a]" />
                        {folder.photos.length} {t.photosCount}
                        {folder.photos.length > 1 && (
                          <span className="text-[9px] text-amber-300 font-normal">
                            ({currentIdx + 1}/{folder.photos.length})
                          </span>
                        )}
                      </span>

                      {/* Destination tag */}
                      <span className="absolute bottom-2.5 left-3 px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-extrabold flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {folder.placeName.split('(')[0].trim()}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-base text-stone-900 dark:text-white line-clamp-1 group-hover:text-[#0e7c66] dark:group-hover:text-emerald-400 transition-colors">
                          {folder.folderName}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-1 font-medium">
                          <Calendar className="w-3 h-3 text-[#e8973a]" />
                          <span>{folder.visitedDate}</span>
                        </div>

                        {/* Story preview if active photo has one */}
                        {activePhoto?.story ? (
                          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 line-clamp-2 leading-relaxed italic bg-stone-50 dark:bg-stone-900/60 p-2 rounded-xl">
                            💬 "{activePhoto.story}"
                          </p>
                        ) : folder.notes ? (
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
                            {folder.notes}
                          </p>
                        ) : null}
                      </div>

                      <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between text-xs">
                        <span className="text-[#0e7c66] dark:text-emerald-400 font-bold flex items-center gap-1">
                          <span>{t.openFolder}</span>
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(t.deleteFolderConfirm)) {
                              onDeleteFolder(folder.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX & SLIDESHOW VIEWER with STORY TEXT */}
      {activeFolder && lightboxPhotoIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          {(() => {
            const currentPhoto = activeFolder.photos[lightboxPhotoIndex];
            if (!currentPhoto) return null;

            const isEditing = editingPhotoId === currentPhoto.id;

            return (
              <div className="relative max-w-4xl w-full max-h-[95vh] flex flex-col justify-between items-center text-white">
                {/* Top Control Bar */}
                <div className="w-full flex items-center justify-between p-2 z-20">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm">
                      {lightboxPhotoIndex + 1} / {activeFolder.photos.length}
                    </span>

                    {/* Auto Slideshow Play/Pause Toggle */}
                    {activeFolder.photos.length > 1 && (
                      <button
                        onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer ${
                          isSlideshowPlaying
                            ? 'bg-[#0e7c66] text-white shadow-sm'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        {isSlideshowPlaying ? (
                          <>
                            <Pause className="w-3 h-3" />
                            <span>{t.pauseSlideshow}</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>{t.playSlideshow}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadPhoto(currentPhoto)}
                      className="w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
                      title="Muat turun foto"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setLightboxPhotoIndex(null);
                        setEditingPhotoId(null);
                      }}
                      className="w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
                      title={t.closeViewer}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Main Photo with smooth transition */}
                <div className="relative w-full flex-1 max-h-[60vh] sm:max-h-[68vh] flex items-center justify-center overflow-hidden my-2">
                  <img
                    key={currentPhoto.id}
                    src={currentPhoto.dataUrl}
                    alt="Kenangan Penuh"
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in fade-in duration-500"
                  />

                  {/* Left & Right navigation arrows */}
                  {activeFolder.photos.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setLightboxPhotoIndex(
                            (prev) => (prev! - 1 + activeFolder.photos.length) % activeFolder.photos.length
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
                        title={t.prevPhoto}
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>

                      <button
                        onClick={() =>
                          setLightboxPhotoIndex((prev) => (prev! + 1) % activeFolder.photos.length)
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
                        title={t.nextPhoto}
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Bottom Story & Narration Box ("tempat text supaya dpt menceritakan apa yg terjadi pada masa itu") */}
                <div className="w-full max-w-2xl bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md space-y-2 z-20">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <MessageSquare className="w-4 h-4" />
                      <span>{t.photoStoryTitle}</span>
                    </span>

                    {!isEditing && (
                      <button
                        onClick={() => handleStartEditStory(currentPhoto)}
                        className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{currentPhoto.story ? t.editPhotoStory : t.addPhotoStory}</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        autoFocus
                        value={editingStoryText}
                        onChange={(e) => setEditingStoryText(e.target.value)}
                        placeholder={t.storyPlaceholder}
                        className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-[#0e7c66]"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingPhotoId(null)}
                          className="px-3 py-1 text-xs text-stone-400 hover:text-white"
                        >
                          {t.cancelStory}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveStory(activeFolder.id, currentPhoto.id)}
                          className="px-4 py-1.5 bg-[#0e7c66] hover:bg-[#0b6754] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t.saveStory}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium italic">
                      {currentPhoto.story
                        ? `"${currentPhoto.story}"`
                        : language === 'en'
                        ? 'No story written yet for this moment. Click the edit button above to describe what happened!'
                        : 'Belum ada cerita ditulis untuk momen ini. Tekan butang sunting di atas untuk menceritakan apa yang berlaku pada masa itu!'}
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
