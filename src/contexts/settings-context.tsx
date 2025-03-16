'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppSettings, defaultSettings } from '@/lib/utils';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Create a throttle function to limit localStorage writes
function throttle<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    lastArgs = args;

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        if (lastArgs) {
          func(...lastArgs);
          lastArgs = null; // Clear reference to prevent memory leaks
        }
        timeoutId = null;
      }, delay - (now - lastCall));
    }
  };
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  // Use ref to store throttled function to prevent recreation on each render
  const throttledSaveRef = useRef<((newSettings: AppSettings) => void) | undefined>(undefined);

  // Load settings from localStorage only once on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
    
    // Create throttled save function only once
    throttledSaveRef.current = throttle((newSettings: AppSettings) => {
      try {
        localStorage.setItem('appSettings', JSON.stringify(newSettings));
      } catch (error) {
        console.error('Error saving settings to localStorage:', error);
      }
    }, 1000); // Throttle to once per second
    
    // Cleanup function to prevent memory leaks
    return () => {
      throttledSaveRef.current = undefined;
    };
  }, []);

  // Memoize the updateSettings function to prevent unnecessary re-renders
  const updateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    if (throttledSaveRef.current) {
      throttledSaveRef.current(newSettings);
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    settings,
    updateSettings
  }), [settings, updateSettings]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 