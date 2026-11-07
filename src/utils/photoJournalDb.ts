/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * IndexedDB storage for Dias.Ai Destination Memory Folders & Photos
 */

import { DestinationFolder, FolderPhoto } from '../types.ts';

const DB_NAME = 'DiasAiDestinationJournalDB';
const DB_VERSION = 1;
const STORE_NAME = 'destination_folders';
const FALLBACK_STORAGE_KEY = 'dias_destination_folders_backup_v1';

// Open IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('placeId', 'placeId', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback to localStorage if IndexedDB fails
function getFallbackFolders(): DestinationFolder[] {
  try {
    const data = localStorage.getItem(FALLBACK_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveFallbackFolders(folders: DestinationFolder[]): void {
  try {
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(folders));
  } catch (err) {
    console.error('Failed to save to localStorage backup', err);
  }
}

// Fetch all destination folders
export async function getAllFolders(): Promise<DestinationFolder[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = request.result || [];
        // Sort descending by createdAt
        result.sort((a, b) => b.createdAt - a.createdAt);
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Using localStorage fallback for folders:', err);
    return getFallbackFolders().sort((a, b) => b.createdAt - a.createdAt);
  }
}

// Save or update folder
export async function saveDestinationFolder(folder: DestinationFolder): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(folder);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Saving folder using fallback:', err);
    const existing = getFallbackFolders();
    const index = existing.findIndex((f) => f.id === folder.id);
    if (index >= 0) {
      existing[index] = folder;
    } else {
      existing.push(folder);
    }
    saveFallbackFolders(existing);
  }
}

// Delete folder
export async function deleteDestinationFolder(folderId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(folderId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Deleting folder using fallback:', err);
    const existing = getFallbackFolders().filter((f) => f.id !== folderId);
    saveFallbackFolders(existing);
  }
}

// Add photo to existing folder
export async function addPhotoToDestinationFolder(
  folderId: string,
  photo: FolderPhoto
): Promise<DestinationFolder | null> {
  const folders = await getAllFolders();
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) return null;

  folder.photos.push(photo);
  await saveDestinationFolder(folder);
  return folder;
}

// Delete photo from folder
export async function deletePhotoFromFolder(
  folderId: string,
  photoId: string
): Promise<DestinationFolder | null> {
  const folders = await getAllFolders();
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) return null;

  folder.photos = folder.photos.filter((p) => p.id !== photoId);
  await saveDestinationFolder(folder);
  return folder;
}

// Update story / caption of a photo in a folder
export async function updatePhotoStory(
  folderId: string,
  photoId: string,
  story: string
): Promise<DestinationFolder | null> {
  const folders = await getAllFolders();
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) return null;

  const photo = folder.photos.find((p) => p.id === photoId);
  if (photo) {
    photo.story = story;
    photo.caption = story;
  }
  await saveDestinationFolder(folder);
  return folder;
}

// Compress client-side image file to sensible max dimension (1280px) and quality
export function compressImageFile(file: File, maxDim = 1280, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
