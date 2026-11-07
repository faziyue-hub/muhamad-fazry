/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Language } from '../types.ts';
import { TRANSLATIONS } from '../utils/translations.ts';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Droplets,
  Wind,
  RotateCw,
  Compass,
  Thermometer,
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  updatedAt: number;
}

const STORAGE_KEY = 'dias_sibu_weather_cache_v1';

// Default typical tropical Sibu weather as fallback
const DEFAULT_SIBU_WEATHER: WeatherData = {
  temperature: 29.5,
  apparentTemperature: 33.0,
  humidity: 82,
  windSpeed: 8.5,
  weatherCode: 2, // Partly cloudy
  tempMax: 32.0,
  tempMin: 24.5,
  updatedAt: Date.now(),
};

interface Props {
  language: Language;
}

export const WeatherWidget: React.FC<Props> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [weather, setWeather] = useState<WeatherData>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : DEFAULT_SIBU_WEATHER;
    } catch {
      return DEFAULT_SIBU_WEATHER;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);

  // Sibu, Sarawak coordinates: lat 2.2873, lng 111.8305
  const fetchWeather = useCallback(async (isManual = false) => {
    if (isManual) setIsLoading(true);

    try {
      const url =
        'https://api.open-meteo.com/v1/forecast?latitude=2.2873&longitude=111.8305&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKuching';

      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API error');

      const data = await res.json();
      const current = data.current;
      const daily = data.daily;

      const newWeather: WeatherData = {
        temperature: Math.round(current.temperature_2m * 10) / 10,
        apparentTemperature: Math.round(current.apparent_temperature * 10) / 10,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
        weatherCode: current.weather_code,
        tempMax: Math.round(daily.temperature_2m_max[0]),
        tempMin: Math.round(daily.temperature_2m_min[0]),
        updatedAt: Date.now(),
      };

      setWeather(newWeather);
      setIsCached(false);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWeather));
    } catch (err) {
      console.warn('Could not fetch live weather, using cached data:', err);
      setIsCached(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(false);
    // Refresh weather every 30 minutes automatically
    const interval = setInterval(() => fetchWeather(false), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  // Decode WMO weather code to icon, label, and contextual traveler tip
  const getWeatherInfo = (code: number) => {
    // 0: Clear
    if (code === 0) {
      return {
        label: t.weatherClear,
        icon: Sun,
        iconColor: 'text-amber-500 fill-amber-400',
        bgGradient: 'from-amber-500/15 via-emerald-500/10 to-teal-500/5 dark:from-amber-950/40 dark:via-emerald-950/30 dark:to-stone-900',
        borderColor: 'border-amber-200 dark:border-amber-800/40',
        tip: t.weatherTipClear,
      };
    }
    // 1, 2: Mainly clear, partly cloudy
    if (code === 1 || code === 2) {
      return {
        label: t.weatherPartlyCloudy,
        icon: CloudSun,
        iconColor: 'text-amber-500',
        bgGradient: 'from-teal-500/15 via-emerald-500/10 to-amber-500/5 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-stone-900',
        borderColor: 'border-emerald-200 dark:border-emerald-800/40',
        tip: t.weatherTipCloudy,
      };
    }
    // 3: Overcast
    if (code === 3) {
      return {
        label: t.weatherOvercast,
        icon: Cloud,
        iconColor: 'text-stone-400',
        bgGradient: 'from-stone-500/15 via-teal-500/10 to-emerald-500/5 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900',
        borderColor: 'border-stone-200 dark:border-stone-700/60',
        tip: t.weatherTipCloudy,
      };
    }
    // 45, 48: Fog
    if (code === 45 || code === 48) {
      return {
        label: t.weatherFog,
        icon: CloudFog,
        iconColor: 'text-stone-400',
        bgGradient: 'from-stone-500/15 via-teal-500/10 to-stone-500/5 dark:from-stone-900 dark:to-stone-900',
        borderColor: 'border-stone-200 dark:border-stone-700/60',
        tip: t.weatherTipCloudy,
      };
    }
    // 51 - 65, 80 - 82: Drizzle & Rain
    if (code >= 51 && code <= 82) {
      return {
        label: code <= 55 ? t.weatherDrizzle : t.weatherRain,
        icon: CloudRain,
        iconColor: 'text-cyan-600 dark:text-cyan-400',
        bgGradient: 'from-cyan-500/15 via-blue-500/10 to-emerald-500/5 dark:from-cyan-950/40 dark:via-blue-950/30 dark:to-stone-900',
        borderColor: 'border-cyan-200 dark:border-cyan-800/40',
        tip: t.weatherTipRain,
      };
    }
    // 95+: Thunderstorm
    if (code >= 95) {
      return {
        label: t.weatherThunderstorm,
        icon: CloudLightning,
        iconColor: 'text-amber-500',
        bgGradient: 'from-indigo-500/15 via-purple-500/10 to-teal-500/5 dark:from-indigo-950/40 dark:via-stone-900 dark:to-stone-900',
        borderColor: 'border-indigo-200 dark:border-indigo-800/40',
        tip: t.weatherTipRain,
      };
    }
    // Default fallback
    return {
      label: t.weatherPartlyCloudy,
      icon: CloudSun,
      iconColor: 'text-amber-500',
      bgGradient: 'from-teal-500/15 via-emerald-500/10 to-amber-500/5 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-stone-900',
      borderColor: 'border-emerald-200 dark:border-emerald-800/40',
      tip: t.weatherTipCloudy,
    };
  };

  const weatherInfo = getWeatherInfo(weather.weatherCode);
  const IconComponent = weatherInfo.icon;

  return (
    <div
      className={`relative rounded-3xl p-4 sm:p-5 bg-gradient-to-br ${weatherInfo.bgGradient} ${weatherInfo.borderColor} border shadow-sm transition-all overflow-hidden`}
    >
      {/* Decorative background circle */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/30 dark:bg-white/5 blur-2xl pointer-events-none" />

      {/* Top Bar: Title & Refresh button */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#0e7c66] animate-pulse" />
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-200">
            {t.weatherTitle}
          </h4>
          <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
            • Sibu, Sarawak
          </span>
        </div>

        <button
          onClick={() => fetchWeather(true)}
          disabled={isLoading}
          title={t.weatherRefresh}
          className="flex items-center gap-1 text-[11px] font-bold text-[#0e7c66] dark:text-emerald-400 hover:text-[#0b6754] active:scale-95 transition-all cursor-pointer disabled:opacity-50 px-2 py-1 rounded-xl bg-white/70 dark:bg-stone-800/70 shadow-xs border border-stone-200/60 dark:border-stone-700/50"
        >
          <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{t.weatherRefresh}</span>
        </button>
      </div>

      {/* Main Stats Row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Left: Temperature & Weather Icon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border border-white dark:border-stone-700/80 flex items-center justify-center shadow-sm shrink-0">
            <IconComponent className={`w-7 h-7 ${weatherInfo.iconColor}`} />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white leading-none">
                {weather.temperature}°C
              </span>
              <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
                {weatherInfo.label}
              </span>
            </div>
            <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mt-0.5">
              {t.weatherFeelsLike} <span className="font-bold">{weather.apparentTemperature}°C</span> • Julat: {weather.tempMin}° - {weather.tempMax}°C
            </p>
          </div>
        </div>

        {/* Right: Key Micro-indicators */}
        <div className="flex items-center gap-2">
          {/* Humidity */}
          <div className="px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-stone-800/70 border border-stone-200/60 dark:border-stone-700/50 flex items-center gap-1.5 text-[11px]">
            <Droplets className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <div>
              <span className="text-stone-400 text-[10px] block leading-none">{t.weatherHumidity}</span>
              <span className="font-bold text-stone-800 dark:text-stone-200 leading-none">{weather.humidity}%</span>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-stone-800/70 border border-stone-200/60 dark:border-stone-700/50 flex items-center gap-1.5 text-[11px]">
            <Wind className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <div>
              <span className="text-stone-400 text-[10px] block leading-none">{t.weatherWind}</span>
              <span className="font-bold text-stone-800 dark:text-stone-200 leading-none">{weather.windSpeed} km/j</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sibu Tourist Dynamic Weather Tip Callout */}
      <div className="mt-3 pt-2.5 border-t border-stone-200/60 dark:border-stone-700/50 flex items-start gap-2 text-xs text-stone-700 dark:text-stone-300">
        <Compass className="w-4 h-4 text-[#e8973a] shrink-0 mt-0.5" />
        <span className="leading-snug font-medium">
          {weatherInfo.tip}
        </span>
      </div>

      {/* Subtle indicator if using cached data */}
      {isCached && (
        <div className="mt-1 text-[10px] text-stone-400 dark:text-stone-500 italic">
          * {t.weatherOfflineNotice}
        </div>
      )}
    </div>
  );
};
