/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { PlaceLocation, PlaceCategory, Language, UserCustomPhotos } from '../types.ts';
import { TRANSLATIONS } from '../utils/translations.ts';
import { calculatePlaceRatingSummary } from '../utils/reviewsManager.ts';
import { Crosshair, Route, Info } from 'lucide-react';

interface Props {
  places: PlaceLocation[];
  routePlaceIds: string[];
  language: Language;
  onSelectPlace: (place: PlaceLocation) => void;
  onToggleRoute: (placeId: string) => void;
  targetFocusPlace: PlaceLocation | null;
  customPhotos: UserCustomPhotos;
}

export const SmartMapTab: React.FC<Props> = ({
  places,
  routePlaceIds,
  language,
  onSelectPlace,
  onToggleRoute,
  targetFocusPlace,
  customPhotos,
}) => {
  const t = TRANSLATIONS[language];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'Semua'>('Semua');

  const categories: (PlaceCategory | 'Semua')[] = ['Semua', 'Makanan', 'Budaya', 'Alam', 'Kampung'];

  const SIBU_CENTER: [number, number] = [2.2950, 111.8350];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: SIBU_CENTER,
      zoom: 13,
      zoomControl: false,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Recenter helper
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(SIBU_CENTER, 13, { animate: true });
    }
  };

  // Re-draw Markers & Route Polyline when places, category, or route changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Filter places by category
    const filteredPlaces = places.filter((p) =>
      selectedCategory === 'Semua' ? true : p.category === selectedCategory
    );

    filteredPlaces.forEach((place) => {
      const routeIndex = routePlaceIds.indexOf(place.id);
      const isOnRoute = routeIndex !== -1;

      // Custom HTML Marker Icon
      const pinColor = isOnRoute ? '#e8973a' : '#0e7c66';
      const labelText = isOnRoute ? `${routeIndex + 1}` : '★';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: ${pinColor};
            color: #ffffff;
            width: 34px;
            height: 34px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            font-weight: 800;
            font-size: 13px;
          ">
            <span style="transform: rotate(45deg);">${labelText}</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      const marker = L.marker([place.coordinates.lat, place.coordinates.lng], {
        icon: customIcon,
      }).addTo(map);

      // Popup Content
      const userPhoto = customPhotos[place.id]?.[0] || place.images[0];
      const ratingSummary = calculatePlaceRatingSummary(place.id);
      const popupHtml = `
        <div style="width: 240px; font-family: system-ui, sans-serif;">
          <div style="height: 110px; width: 100%; overflow: hidden; position: relative;">
            <img src="${userPhoto}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
            <span style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.65); color: #fff; font-size: 10px; padding: 2px 8px; border-radius: 9999px; font-weight: 700;">
              ${place.category}
            </span>
          </div>
          <div style="padding: 12px;">
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #1c1917; line-height: 1.2;">
              ${place.name}
            </h4>
            <div style="font-size: 11px; color: #78716c; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
              <span>⏱ ~${place.estimatedMinutes} ${t.minutesUnit}</span>
              <span style="color: #d97706; font-weight: 700;">⭐ ${ratingSummary.averageRating} (${ratingSummary.totalReviews})</span>
            </div>
            <button id="popup-btn-detail-${place.id}" style="
              width: 100%;
              padding: 7px 10px;
              background: #0e7c66;
              color: white;
              font-weight: 700;
              font-size: 12px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              margin-bottom: 4px;
            ">
              ${t.openDetails}
            </button>
            <button id="popup-btn-route-${place.id}" style="
              width: 100%;
              padding: 6px 10px;
              background: ${isOnRoute ? '#fecdd3' : '#fef3c7'};
              color: ${isOnRoute ? '#9f1239' : '#92400e'};
              font-weight: 700;
              font-size: 11px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
            ">
              ${isOnRoute ? t.removeFromRoute : t.addToRoute}
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Handle popup button clicks safely
      marker.on('popupopen', () => {
        const detailBtn = document.getElementById(`popup-btn-detail-${place.id}`);
        if (detailBtn) {
          detailBtn.onclick = () => onSelectPlace(place);
        }
        const routeBtn = document.getElementById(`popup-btn-route-${place.id}`);
        if (routeBtn) {
          routeBtn.onclick = () => {
            onToggleRoute(place.id);
            marker.closePopup();
          };
        }
      });

      markersRef.current[place.id] = marker;
    });

    // Draw Polyline Route connecting places in routePlaceIds
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const routeCoords: [number, number][] = [];
    routePlaceIds.forEach((id) => {
      const p = places.find((item) => item.id === id);
      if (p) {
        routeCoords.push([p.coordinates.lat, p.coordinates.lng]);
      }
    });

    if (routeCoords.length >= 2) {
      polylineRef.current = L.polyline(routeCoords, {
        color: '#e8973a',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.9,
      }).addTo(map);
    }
  }, [places, selectedCategory, routePlaceIds, language, customPhotos, onSelectPlace, onToggleRoute]);

  // Handle focus when targetFocusPlace is provided
  useEffect(() => {
    if (!targetFocusPlace || !mapInstanceRef.current) return;
    const targetMarker = markersRef.current[targetFocusPlace.id];
    if (targetMarker) {
      mapInstanceRef.current.flyTo(
        [targetFocusPlace.coordinates.lat, targetFocusPlace.coordinates.lng],
        15,
        { animate: true, duration: 1.2 }
      );
      setTimeout(() => {
        targetMarker.openPopup();
      }, 1200);
    }
  }, [targetFocusPlace]);

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] flex flex-col">
      {/* Top Floating Filter Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pointer-events-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md backdrop-blur-md transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0e7c66] text-white shadow-[#0e7c66]/30'
                  : 'bg-white/95 dark:bg-stone-900/95 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
              }`}
            >
              {cat === 'Semua' ? t.catAll : cat}
            </button>
          ))}
        </div>

        {/* Route Status Pill if places are selected */}
        {routePlaceIds.length > 0 && (
          <div className="self-start px-3 py-1 rounded-full bg-[#e8973a] text-white text-[11px] font-bold shadow-md flex items-center gap-1.5 pointer-events-auto">
            <Route className="w-3.5 h-3.5" />
            <span>
              {t.legendRoute}: {routePlaceIds.length} {t.routeStopsCount}
            </span>
          </div>
        )}
      </div>

      {/* Recenter Button */}
      <button
        onClick={handleRecenter}
        title={t.recenterMap}
        className="absolute bottom-6 left-4 z-[1000] p-3 rounded-2xl bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 shadow-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
      >
        <Crosshair className="w-4 h-4 text-[#0e7c66]" />
        <span className="hidden sm:inline">{t.recenterMap}</span>
      </button>

      {/* Map Interactive Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Quick Info bar at bottom */}
      <div className="absolute bottom-2 right-14 z-[1000] hidden sm:flex items-center gap-1 bg-white/90 dark:bg-stone-900/90 text-stone-600 dark:text-stone-400 text-[11px] px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-800 pointer-events-none">
        <Info className="w-3 h-3 text-[#0e7c66]" />
        <span>Tekan penanda untuk pratonton & butiran</span>
      </div>
    </div>
  );
};
