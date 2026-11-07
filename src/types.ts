/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlaceCategory, PlaceLocation, SibuFact, HalalStatus, DietaryOption } from './data/sibuPlaces.ts';

export type { PlaceCategory, PlaceLocation, SibuFact, HalalStatus, DietaryOption };

export type Language = 'ms' | 'en';
export type ThemeMode = 'light' | 'dark';

export type NavigationTab = 'home' | 'gallery' | 'map' | 'itinerary' | 'journal' | 'chat';

export type TravelerType = 'solo' | 'family' | 'couple' | 'friends' | 'local';

export interface UserReview {
  id: string;
  placeId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  travelerType?: TravelerType;
  date: string;
  createdAt: number;
  isUserSubmitted?: boolean;
}

export interface PlaceRatingSummary {
  averageRating: number;
  totalReviews: number;
  breakdown: { [stars: number]: number };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'dias';
  text: string;
  timestamp: number;
}

export interface UserCustomPhotos {
  [placeId: string]: string[]; // Custom data URLs or image URLs uploaded by user
}

export interface FolderPhoto {
  id: string;
  dataUrl: string;
  caption?: string;
  story?: string; // Cerita apa yang terjadi pada masa itu
  momentTime?: string; // Masa atau waktu spesifik momen tersebut
  uploadedAt: number;
}

export interface DestinationFolder {
  id: string;
  placeId: string;
  placeName: string;
  folderName: string;
  visitedDate: string;
  notes?: string;
  photos: FolderPhoto[];
  createdAt: number;
}

export interface AiItineraryResult {
  title: string;
  summary: string;
  placeIds: string[];
  totalEstimatedMinutes: number;
  routeTips?: string[];
  source?: string;
}
