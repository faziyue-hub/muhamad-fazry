/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlaceLocation, Language, DestinationFolder } from '../types.ts';
import { TRANSLATIONS } from '../utils/translations.ts';
import { compressImageFile } from '../utils/photoJournalDb.ts';
import {
  X,
  FolderPlus,
  MapPin,
  Calendar,
  FileText,
  Upload,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  places: PlaceLocation[];
  preselectedPlaceId?: string;
  language: Language;
  onFolderCreated: (folder: DestinationFolder) => void;
}

export const CreateFolderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  places,
  preselectedPlaceId,
  language,
  onFolderCreated,
}) => {
  const t = TRANSLATIONS[language];

  const defaultPlaceId = preselectedPlaceId || places[0]?.id || '';
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(defaultPlaceId);
  const [customPlaceName, setCustomPlaceName] = useState<string>('');
  const [folderName, setFolderName] = useState<string>('');
  const [visitedDate, setVisitedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState<string>('');
  const [selectedPhotos, setSelectedPhotos] = useState<
    { dataUrl: string; caption?: string }[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const processed: { dataUrl: string; caption?: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await compressImageFile(file, 1280, 0.82);
        processed.push({ dataUrl });
      }
      setSelectedPhotos((prev) => [...prev, ...processed]);
    } catch (err) {
      console.error('Error processing photos:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveSelectedPhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    let placeName = 'Sibu, Sarawak';
    if (selectedPlaceId === 'custom') {
      placeName = customPlaceName.trim() || 'Destinasi Sibu';
    } else {
      const found = places.find((p) => p.id === selectedPlaceId);
      if (found) placeName = found.name;
    }

    const newFolder: DestinationFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      placeId: selectedPlaceId,
      placeName,
      folderName: folderName.trim(),
      visitedDate,
      notes: notes.trim(),
      photos: selectedPhotos.map((p, idx) => ({
        id: `photo-${Date.now()}-${idx}`,
        dataUrl: p.dataUrl,
        story: p.caption || '',
        caption: p.caption || '',
        uploadedAt: Date.now(),
      })),
      createdAt: Date.now(),
    };

    onFolderCreated(newFolder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg max-h-[92vh] bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0e7c66] text-white flex items-center justify-center shadow-md">
              <FolderPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                {t.createFolder}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {t.journalSubtitle}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 1. Destination Select */}
          <div>
            <label className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0e7c66]" />
              {t.selectDestination}
            </label>
            <select
              value={selectedPlaceId}
              onChange={(e) => setSelectedPlaceId(e.target.value)}
              className="w-full py-2.5 px-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7c66]"
            >
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
              <option value="custom">
                {language === 'en' ? '+ Other / Custom Sibu Spot' : '+ Tempat Lain / Tersuai di Sibu'}
              </option>
            </select>

            {selectedPlaceId === 'custom' && (
              <input
                type="text"
                value={customPlaceName}
                onChange={(e) => setCustomPlaceName(e.target.value)}
                placeholder={language === 'en' ? 'Enter destination name...' : 'Masukkan nama tempat...'}
                className="w-full mt-2 py-2.5 px-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7c66]"
              />
            )}
          </div>

          {/* 2. Folder Name */}
          <div>
            <label className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <FolderPlus className="w-3.5 h-3.5 text-[#e8973a]" />
              {t.folderNameLabel} *
            </label>
            <input
              type="text"
              required
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder={t.folderNamePlaceholder}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7c66]"
            />
          </div>

          {/* 3. Visited Date */}
          <div>
            <label className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0e7c66]" />
              {t.visitDateLabel}
            </label>
            <input
              type="date"
              value={visitedDate}
              onChange={(e) => setVisitedDate(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7c66]"
            />
          </div>

          {/* 4. Travel Notes */}
          <div>
            <label className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              {t.notesLabel}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              className="w-full py-2 px-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7c66]"
            />
          </div>

          {/* 5. Upload Photos */}
          <div>
            <label className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#e8973a]" />
              {t.uploadPhotosToFolder}
            </label>

            <label className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#0e7c66] dark:hover:border-emerald-500 bg-stone-50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer active:scale-98 transition-all">
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0e7c66]" />
                  <span>Memproses gambar...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-[#0e7c66]" />
                  <span>{t.choosePhotos} (Boleh pilih banyak)</span>
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={isProcessing}
                onChange={handleFileSelect}
              />
            </label>

            {/* Photo Previews */}
            {selectedPhotos.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {selectedPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden bg-stone-900 border border-stone-200 dark:border-stone-700 group"
                  >
                    <img
                      src={photo.dataUrl}
                      alt="Pratonton"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedPhoto(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!folderName.trim() || isProcessing}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0e7c66] to-[#0b6754] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FolderPlus className="w-4 h-4" />
              <span>{t.createFolder}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
