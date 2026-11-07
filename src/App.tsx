/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Language,
  ThemeMode,
  NavigationTab,
  PlaceLocation,
  ChatMessage,
  UserCustomPhotos,
  DestinationFolder,
  FolderPhoto,
} from './types.ts';
import { INITIAL_SIBU_PLACES, SIBU_FACTS } from './data/sibuPlaces.ts';
import {
  getSavedFavorites,
  saveFavorites,
  getSavedRoute,
  saveRoute,
  getSavedCustomPhotos,
  saveCustomPhotos,
  getSavedLanguage,
  saveLanguage,
  getSavedTheme,
  saveTheme,
  getSavedChatHistory,
  saveChatHistory,
} from './utils/storage.ts';
import {
  getAllFolders,
  saveDestinationFolder,
  deleteDestinationFolder,
  addPhotoToDestinationFolder,
  deletePhotoFromFolder,
  updatePhotoStory,
} from './utils/photoJournalDb.ts';

import { HeaderNav } from './components/HeaderNav.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { HomeTab } from './components/HomeTab.tsx';
import { GalleryTab } from './components/GalleryTab.tsx';
import { SmartMapTab } from './components/SmartMapTab.tsx';
import { ItineraryTab } from './components/ItineraryTab.tsx';
import { JournalTab } from './components/JournalTab.tsx';
import { ChatDiasTab } from './components/ChatDiasTab.tsx';
import { PlaceDetailModal } from './components/PlaceDetailModal.tsx';
import { AiItineraryModal } from './components/AiItineraryModal.tsx';
import { CreateFolderModal } from './components/CreateFolderModal.tsx';
import { ShareJourneyModal } from './components/ShareJourneyModal.tsx';

export default function App() {
  // Core state
  const [places] = useState<PlaceLocation[]>(INITIAL_SIBU_PLACES);
  const [facts] = useState(SIBU_FACTS);
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  // Preferences & Persistence
  const [language, setLanguage] = useState<Language>(getSavedLanguage);
  const [theme, setTheme] = useState<ThemeMode>(getSavedTheme);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(getSavedFavorites);
  const [routePlaceIds, setRoutePlaceIds] = useState<string[]>(getSavedRoute);
  const [customPhotos, setCustomPhotos] = useState<UserCustomPhotos>(getSavedCustomPhotos);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(getSavedChatHistory);

  // Destination memory folders state
  const [destinationFolders, setDestinationFolders] = useState<DestinationFolder[]>([]);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [preselectedPlaceForFolder, setPreselectedPlaceForFolder] = useState<string>('');

  // Share Journey modal state
  const [isShareJourneyOpen, setIsShareJourneyOpen] = useState(false);
  const [shareJourneyFolderId, setShareJourneyFolderId] = useState<string | null>(null);

  const handleOpenShareJourney = (folderId?: string) => {
    setShareJourneyFolderId(folderId || null);
    setIsShareJourneyOpen(true);
  };

  // Modals & Navigation triggers
  const [selectedPlaceModal, setSelectedPlaceModal] = useState<PlaceLocation | null>(null);
  const [targetFocusPlace, setTargetFocusPlace] = useState<PlaceLocation | null>(null);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Load destination folders on startup
  useEffect(() => {
    getAllFolders().then((folders) => {
      setDestinationFolders(folders);
    });
  }, []);

  // Sync theme with HTML document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Language toggle
  const handleToggleLanguage = () => {
    const nextLang: Language = language === 'ms' ? 'en' : 'ms';
    setLanguage(nextLang);
    saveLanguage(nextLang);
  };

  // Theme toggle
  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  // Toggle favorite place
  const handleToggleFavorite = (placeId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId];
      saveFavorites(next);
      return next;
    });
  };

  // Toggle route place (Add / Remove)
  const handleToggleRoute = (placeId: string) => {
    setRoutePlaceIds((prev) => {
      const next = prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId];
      saveRoute(next);
      return next;
    });
  };

  // Remove place from route directly
  const handleRemoveFromRoute = (placeId: string) => {
    setRoutePlaceIds((prev) => {
      const next = prev.filter((id) => id !== placeId);
      saveRoute(next);
      return next;
    });
  };

  // Move place in route order (Reorder)
  const handleMovePlace = (fromIndex: number, toIndex: number) => {
    setRoutePlaceIds((prev) => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      saveRoute(updated);
      return updated;
    });
  };

  // Clear entire route
  const handleClearRoute = () => {
    setRoutePlaceIds([]);
    saveRoute([]);
  };

  // Apply AI generated route
  const handleApplyAiRoute = (newPlaceIds: string[]) => {
    setRoutePlaceIds(newPlaceIds);
    saveRoute(newPlaceIds);
    setActiveTab('itinerary');
  };

  // Upload user's custom photo for a place
  const handleUploadPhoto = (placeId: string, photoDataUrl: string) => {
    setCustomPhotos((prev) => {
      const existing = prev[placeId] || [];
      const updated = {
        ...prev,
        [placeId]: [photoDataUrl, ...existing].slice(0, 4), // Keep up to 4 custom photos
      };
      saveCustomPhotos(updated);
      return updated;
    });
  };

  // Reset photos back to original defaults
  const handleResetPhotos = (placeId: string) => {
    setCustomPhotos((prev) => {
      const updated = { ...prev };
      delete updated[placeId];
      saveCustomPhotos(updated);
      return updated;
    });
  };

  // Show place on Smart Map
  const handleShowOnMap = (place: PlaceLocation) => {
    setTargetFocusPlace(place);
    setActiveTab('map');
  };

  // Destination Folders handlers
  const handleFolderCreated = async (newFolder: DestinationFolder) => {
    await saveDestinationFolder(newFolder);
    setDestinationFolders((prev) => [newFolder, ...prev]);
    setActiveTab('journal');
  };

  const handleDeleteFolder = async (folderId: string) => {
    await deleteDestinationFolder(folderId);
    setDestinationFolders((prev) => prev.filter((f) => f.id !== folderId));
  };

  const handleAddPhotosToFolder = async (folderId: string, newPhotos: FolderPhoto[]) => {
    const folders = await getAllFolders();
    const folder = folders.find((f) => f.id === folderId);
    if (folder) {
      folder.photos.push(...newPhotos);
      await saveDestinationFolder(folder);
      setDestinationFolders([...folders]);
    }
  };

  const handleDeletePhotoFromFolder = async (folderId: string, photoId: string) => {
    const updatedFolder = await deletePhotoFromFolder(folderId, photoId);
    if (updatedFolder) {
      setDestinationFolders((prev) =>
        prev.map((f) => (f.id === folderId ? updatedFolder : f))
      );
    }
  };

  const handleOpenCreateFolderModal = (placeId?: string) => {
    setPreselectedPlaceForFolder(placeId || '');
    setIsCreateFolderModalOpen(true);
  };

  const handleUpdatePhotoStory = async (folderId: string, photoId: string, story: string) => {
    const updatedFolder = await updatePhotoStory(folderId, photoId, story);
    if (updatedFolder) {
      setDestinationFolders((prev) =>
        prev.map((f) => (f.id === folderId ? updatedFolder : f))
      );
    }
  };

  // Send message in "Tanya Dias"
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          lang: language,
          conversationHistory: updatedMessages.slice(-6),
        }),
      });

      let reply = '';
      if (response.ok) {
        const data = await response.json();
        reply = data.reply;
      } else {
        reply =
          language === 'en'
            ? 'Thank you for reaching out! Please explore the Sibu attractions in the gallery, and verify opening hours before visiting.'
            : 'Terima kasih atas pertanyaan anda! Sila teroka tarikan Sibu di galeri, dan sahkan waktu operasi sebelum pergi.';
      }

      const diasMsg: ChatMessage = {
        id: `dias-${Date.now()}`,
        sender: 'dias',
        text: reply,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, diasMsg];
      setChatMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (err) {
      console.error('Chat error:', err);
      const diasMsg: ChatMessage = {
        id: `dias-${Date.now()}`,
        sender: 'dias',
        text:
          language === 'en'
            ? 'Welcome to Sibu! Sibu Central Market, Foochow Kompia shops, Tua Pek Kong Temple, and Rajang Esplanade are popular highlights. Please verify specific details before visiting.'
            : 'Selamat datai ke Sibu! Pasar Pusat Sibu, Kompia Foochow, Kuil Tua Pek Kong, dan Tebing Batang Rajang adalah antara tarikan utama. Sila sahkan butiran lanjut sebelum berkunjung.',
        timestamp: Date.now(),
      };
      const finalMessages = [...updatedMessages, diasMsg];
      setChatMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Clear chat history
  const handleClearChat = () => {
    setChatMessages([]);
    saveChatHistory([]);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors">
      {/* Top Header Bar */}
      <HeaderNav
        language={language}
        onToggleLanguage={handleToggleLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenAiPlanner={() => setIsAiPlannerOpen(true)}
        isOnline={isOnline}
      />

      {/* Main Tab Viewport */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <HomeTab
            places={places}
            facts={facts}
            language={language}
            onSelectPlace={(p) => setSelectedPlaceModal(p)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenAiPlanner={() => setIsAiPlannerOpen(true)}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            routePlaceIds={routePlaceIds}
            onToggleRoute={handleToggleRoute}
            customPhotos={customPhotos}
            foldersCount={destinationFolders.length}
            onOpenCreateFolder={() => handleOpenCreateFolderModal()}
            onOpenShareJourney={() => handleOpenShareJourney()}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryTab
            places={places}
            language={language}
            onSelectPlace={(p) => setSelectedPlaceModal(p)}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            routePlaceIds={routePlaceIds}
            onToggleRoute={handleToggleRoute}
            customPhotos={customPhotos}
          />
        )}

        {activeTab === 'map' && (
          <SmartMapTab
            places={places}
            routePlaceIds={routePlaceIds}
            language={language}
            onSelectPlace={(p) => setSelectedPlaceModal(p)}
            onToggleRoute={handleToggleRoute}
            targetFocusPlace={targetFocusPlace}
            customPhotos={customPhotos}
          />
        )}

        {activeTab === 'itinerary' && (
          <ItineraryTab
            places={places}
            routePlaceIds={routePlaceIds}
            language={language}
            onSelectPlace={(p) => setSelectedPlaceModal(p)}
            onMovePlace={handleMovePlace}
            onRemoveFromRoute={handleRemoveFromRoute}
            onClearRoute={handleClearRoute}
            onOpenAiPlanner={() => setIsAiPlannerOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            customPhotos={customPhotos}
            onCreateFolderForPlace={handleOpenCreateFolderModal}
            onOpenShareJourney={() => handleOpenShareJourney()}
          />
        )}

        {activeTab === 'journal' && (
          <JournalTab
            folders={destinationFolders}
            places={places}
            language={language}
            onOpenCreateModal={() => handleOpenCreateFolderModal()}
            onDeleteFolder={handleDeleteFolder}
            onAddPhotosToFolder={handleAddPhotosToFolder}
            onDeletePhotoFromFolder={handleDeletePhotoFromFolder}
            onUpdatePhotoStory={handleUpdatePhotoStory}
            onOpenShareJourney={handleOpenShareJourney}
          />
        )}

        {activeTab === 'chat' && (
          <ChatDiasTab
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            language={language}
            isLoading={isChatLoading}
          />
        )}
      </main>

      {/* Place Details Modal (Screen 3) */}
      {selectedPlaceModal && (
        <PlaceDetailModal
          place={selectedPlaceModal}
          onClose={() => setSelectedPlaceModal(null)}
          language={language}
          isFavorite={favoriteIds.includes(selectedPlaceModal.id)}
          onToggleFavorite={handleToggleFavorite}
          isInRoute={routePlaceIds.includes(selectedPlaceModal.id)}
          onToggleRoute={handleToggleRoute}
          onShowOnMap={handleShowOnMap}
          customPhotos={customPhotos[selectedPlaceModal.id] || []}
          onUploadPhoto={handleUploadPhoto}
          onResetPhotos={handleResetPhotos}
          destinationFolders={destinationFolders}
          onCreateFolderForPlace={handleOpenCreateFolderModal}
          onOpenJournalFolder={() => {
            setActiveTab('journal');
          }}
          onSelectAlternativePlace={(placeId) => {
            const altPlace = places.find((p) => p.id === placeId);
            if (altPlace) {
              setSelectedPlaceModal(altPlace);
            }
          }}
        />
      )}

      {/* AI Itinerary Planner Modal (Screen 7) */}
      {isAiPlannerOpen && (
        <AiItineraryModal
          isOpen={isAiPlannerOpen}
          onClose={() => setIsAiPlannerOpen(false)}
          places={places}
          language={language}
          onApplyRoute={handleApplyAiRoute}
        />
      )}

      {/* Create Destination Memory Folder Modal */}
      {isCreateFolderModalOpen && (
        <CreateFolderModal
          isOpen={isCreateFolderModalOpen}
          onClose={() => setIsCreateFolderModalOpen(false)}
          places={places}
          preselectedPlaceId={preselectedPlaceForFolder}
          language={language}
          onFolderCreated={handleFolderCreated}
        />
      )}

      {/* Share Journey Summary Card Modal */}
      {isShareJourneyOpen && (
        <ShareJourneyModal
          isOpen={isShareJourneyOpen}
          onClose={() => setIsShareJourneyOpen(false)}
          folders={destinationFolders}
          places={places}
          language={language}
          preselectedFolderId={shareJourneyFolderId}
        />
      )}

      {/* Bottom Thumb-Friendly Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        itineraryCount={routePlaceIds.length}
        foldersCount={destinationFolders.length}
      />
    </div>
  );
}
