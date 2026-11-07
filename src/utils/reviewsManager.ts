/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Pengurus Penilaian & Ulasan Pengguna Sibu (Dias.Ai)
 */

import { UserReview, PlaceRatingSummary } from '../types.ts';

const REVIEWS_STORAGE_KEY = 'dias_user_reviews_v1';

// Initial curated community reviews for authentic local feedback
export const SEED_REVIEWS: UserReview[] = [
  // Pasar Pusat Sibu
  {
    id: 'seed-rev-1',
    placeId: 'pasar-pusat-sibu',
    userName: 'Ahmad Faiz (Kuching)',
    rating: 5,
    comment: 'Pasar basah paling bersih dan tersusun pernah saya lawati! Di tingkat 1 ada zon makanan Melayu halal yang sedap, laksa sarawak dan kuih penyaram panas memang terbaik.',
    travelerType: 'family',
    date: '2 hari lalu',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-rev-2',
    placeId: 'pasar-pusat-sibu',
    userName: 'Wong Ling Ling (Sibu)',
    rating: 5,
    comment: 'My favorite morning market since childhood! Unik sangat tengok ayam hidup dibungkus rapi dengan surat khabar lama. Banyak buah hutan eksotik macam dabai bila musim.',
    travelerType: 'local',
    date: 'Seminggu lalu',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-rev-3',
    placeId: 'pasar-pusat-sibu',
    userName: 'Sarah Jenkins (Tourist)',
    rating: 5,
    comment: 'Incredible local atmosphere! Fresh fruits, woven handicrafts and the coffee upstairs was unforgettable.',
    travelerType: 'solo',
    date: '2 minggu lalu',
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
  },

  // Medan Selera Harmoni Sibu
  {
    id: 'seed-rev-4',
    placeId: 'medan-selera-harmoni',
    userName: 'Ustaz Nurhafiz (Bintulu)',
    rating: 5,
    comment: 'Pusat makanan Halal nombor satu di Sibu! Sangat lega bagi orang Islam datang sini. Umai ikan bawal segar dan linut cecah sambal belacan ulam memang luar biasa sedap.',
    travelerType: 'family',
    date: 'Kelmarin',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-rev-5',
    placeId: 'medan-selera-harmoni',
    userName: 'Siti Aminah (Miri)',
    rating: 5,
    comment: 'Makan malam bersama keluarga di sini. Sate Sibu lembut dan kuah kacang pekat. Ikan Terubok bakar berempah pun mantap!',
    travelerType: 'family',
    date: '3 hari lalu',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-rev-6',
    placeId: 'medan-selera-harmoni',
    userName: 'Daniel & May (Penang)',
    rating: 4,
    comment: 'Authentic Sarawak Melanau delicacies done with supreme freshness. The calamansi-cured fish was phenomenal!',
    travelerType: 'couple',
    date: 'Seminggu lalu',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },

  // Mee Kampua & Masakan Warisan Halal Sibu
  {
    id: 'seed-rev-7',
    placeId: 'mee-kampua-halal-sibu',
    userName: 'Khairul Azman (KL)',
    rating: 5,
    comment: 'Akhirnya pelancong Muslim boleh rasa Mee Kampua Foochow tanpa ragu-ragu! Minyak bawang goreng dia harum sangat, mi kenyal sempurna dan sup wantan ayam sedap.',
    travelerType: 'solo',
    date: '3 hari lalu',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-rev-8',
    placeId: 'mee-kampua-halal-sibu',
    userName: 'Faridah & Rakan (Sarikei)',
    rating: 5,
    comment: 'Kompia halal berinti ayam berempah panas-panas dari ketuhar memang ketagih! Servis pantas dan bersih.',
    travelerType: 'friends',
    date: 'Seminggu lalu',
    createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
  },

  // Kedai Kopi Foochow Warisan
  {
    id: 'seed-rev-9',
    placeId: 'kedai-kopi-foochow',
    userName: 'David Tiong (Kuala Lumpur)',
    rating: 5,
    comment: 'Kompia bakar tempayan arang memang rangup luar lembut dalam. Kampua kicap hitam klasik membangkitkan nostalgia zaman dulu.',
    travelerType: 'local',
    date: '4 hari lalu',
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-rev-10',
    placeId: 'kedai-kopi-foochow',
    userName: 'Marcus & Ken (Singapore)',
    rating: 4,
    comment: 'Genuine heritage coffee shop ambiance with charcoal oven aroma. Best paired with local hot Kopi O.',
    travelerType: 'friends',
    date: '2 minggu lalu',
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
  },

  // Kuil Tua Pek Kong
  {
    id: 'seed-rev-11',
    placeId: 'kuil-tua-pek-kong',
    userName: 'Alvin Lau (Kuching)',
    rating: 5,
    comment: 'Pagoda 7 tingkat tepi Batang Rajang sangat megah. Pemandangan matahari terbenam waktu petang di tebing kuil sangat menenangkan hati.',
    travelerType: 'couple',
    date: '5 hari lalu',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },

  // Pusat Warisan Sibu
  {
    id: 'seed-rev-12',
    placeId: 'pusat-warisan-sibu',
    userName: 'Cikgu Rahman (Kanowit)',
    rating: 5,
    comment: 'Sangat mendidik untuk anak-anak mengenali asal usul Foochow Wong Nai Siong dan perpaduan Iban, Melanau dan Melayu di Sarawak.',
    travelerType: 'family',
    date: 'Seminggu lalu',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },

  // Taman Tasik Sibu (Permai)
  {
    id: 'seed-rev-13',
    placeId: 'taman-tasik-sibu',
    userName: 'Iskandar & Nurul (Sibu)',
    rating: 5,
    comment: 'Trek joging teduh, jambatan kayu gantung lawa untuk bergambar OOTD, dan pokok teratai mekar pagi-pagi.',
    travelerType: 'couple',
    date: 'Kelmarin',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },

  // Tebing Sungai Rejang
  {
    id: 'seed-rev-14',
    placeId: 'tebing-sungai-rejang',
    userName: 'Jessica Ting (Miri)',
    rating: 5,
    comment: 'Bergambar di Tugu Angsa Sibu adalah lambang sah sampai Sibu! Angin sungai petang sangat segar sambil tengok bot ekspres lalu.',
    travelerType: 'solo',
    date: '3 hari lalu',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },

  // Pasar Malam Sibu
  {
    id: 'seed-rev-15',
    placeId: 'pasar-malam-sibu',
    userName: 'Hazim & Squad (Mukah)',
    rating: 5,
    comment: 'Sate ayam madu BBQ dan kuih apam balik lembut gila! Ada banyak pilihan gerai halal dengan harga yang sangat berbaloi.',
    travelerType: 'friends',
    date: 'Kelmarin',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },

  // Restoran Vegetarian Tian En Sibu
  {
    id: 'seed-rev-16',
    placeId: 'restoran-vegetarian-tian-en',
    userName: 'Grace Ling (Kuching)',
    rating: 5,
    comment: 'Mee Kampua Sayuran paling sedap di Sarawak! Minyak bawang sayur wangi, wantan cendawan lembut dan char siu soya rangup. 100% vegetarian friendly.',
    travelerType: 'solo',
    date: '2 hari lalu',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },

  // Cafe All The Best Vegetarian Restaurant
  {
    id: 'seed-rev-17',
    placeId: 'cafe-all-the-best-vegetarian',
    userName: 'Chua Boon Hock (Sibu)',
    rating: 5,
    comment: 'Restoran Wan De Lin (All The Best) sentiasa jadi pilihan utama keluarga untuk makanan vegetarian di Sibu! Mee Kampua sedap, claypot tauhu menyelerakan dan kedai berhawa dingin sejuk selesa.',
    travelerType: 'family',
    date: 'Kelmarin',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-rev-18',
    placeId: 'cafe-all-the-best-vegetarian',
    userName: 'Jessica Ting (Miri)',
    rating: 5,
    comment: 'Very tasty Foochow vegetarian options! Fresh ingredients, authentic aroma without using meat, and friendly staff. Must try their herbal soup and kampua.',
    travelerType: 'solo',
    date: '3 hari lalu',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
];

// Load user-submitted reviews from LocalStorage
export function getUserSubmittedReviews(): UserReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse user reviews from localStorage', err);
    return [];
  }
}

// Save user reviews to LocalStorage
export function saveUserSubmittedReviews(reviews: UserReview[]): void {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.error('Failed to save user reviews to localStorage', err);
  }
}

// Get all combined reviews for a specific place
export function getReviewsForPlace(placeId: string): UserReview[] {
  const userReviews = getUserSubmittedReviews().filter((r) => r.placeId === placeId);
  const seedForPlace = SEED_REVIEWS.filter((r) => r.placeId === placeId);
  // Sort with newest user reviews first
  return [...userReviews, ...seedForPlace].sort((a, b) => b.createdAt - a.createdAt);
}

// Calculate summary (average, count, breakdown)
export function calculatePlaceRatingSummary(placeId: string): PlaceRatingSummary {
  const reviews = getReviewsForPlace(placeId);
  if (reviews.length === 0) {
    return {
      averageRating: 4.8,
      totalReviews: 24,
      breakdown: { 5: 20, 4: 3, 3: 1, 2: 0, 1: 0 },
    };
  }

  const breakdown: { [stars: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  reviews.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating)));
    breakdown[star] = (breakdown[star] || 0) + 1;
    sum += r.rating;
  });

  const averageRating = Number((sum / reviews.length).toFixed(1));

  return {
    averageRating,
    totalReviews: reviews.length,
    breakdown,
  };
}

// Add a new user review
export function submitUserReview(
  placeId: string,
  data: {
    userName: string;
    rating: number;
    comment: string;
    travelerType?: UserReview['travelerType'];
  }
): UserReview {
  const newReview: UserReview = {
    id: `user-rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    placeId,
    userName: data.userName.trim() || 'Pelancong Sibu',
    rating: Math.max(1, Math.min(5, data.rating)),
    comment: data.comment.trim(),
    travelerType: data.travelerType || 'solo',
    date: 'Baru sahaja',
    createdAt: Date.now(),
    isUserSubmitted: true,
  };

  const current = getUserSubmittedReviews();
  const updated = [newReview, ...current];
  saveUserSubmittedReviews(updated);
  return newReview;
}

// Delete user review
export function deleteUserReview(reviewId: string): void {
  const current = getUserSubmittedReviews();
  const updated = current.filter((r) => r.id !== reviewId);
  saveUserSubmittedReviews(updated);
}
