import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { alertEngine, AlertTriggerEvent } from '../services/alertEngine';
import { audioEngine } from '../services/audioEngine';
import { geolocationService, GeolocationErrorState } from '../services/geolocation';
import { extractStopsFromRoute, fetchRealRoutes } from '../services/routing';
import { storage } from '../services/storage';
import {
  ActiveJourney,
  Coordinates,
  FavouriteRoute,
  JourneyHistoryRecord,
  LocationPlace,
  RouteOption,
  TravelMode
} from '../types';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'urgent';
}

interface JourneyContextType {
  activeJourney: ActiveJourney | null;
  journeyHistory: JourneyHistoryRecord[];
  favouriteRoutes: FavouriteRoute[];
  currentGPS: Coordinates | null;
  gpsError: GeolocationErrorState | null;
  isTracking: boolean;
  isNapAlertActive: boolean;
  isArrivalModalOpen: boolean;
  isSOSModalOpen: boolean;
  activeToast: ToastMessage | null;
  startJourney: (
    source: LocationPlace,
    destination: LocationPlace,
    mode: TravelMode,
    selectedRoute: RouteOption,
    availableRoutes: RouteOption[]
  ) => void;
  stopJourney: (completed?: boolean) => void;
  pauseJourney: () => void;
  resumeJourney: () => void;
  recalculateActiveRoute: () => Promise<boolean>;
  saveAsFavourite: (title: string) => void;
  deleteFavourite: (id: string) => void;
  clearHistory: () => void;
  dismissNapAlert: () => void;
  closeArrivalModal: () => void;
  openSOSModal: () => void;
  closeSOSModal: () => void;
  showToast: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'urgent') => void;
  refreshGPS: () => Promise<Coordinates | null>;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export const JourneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { language, voiceLanguage, alertSettings, t } = useSettings();

  const [activeJourney, setActiveJourney] = useState<ActiveJourney | null>(null);
  const [journeyHistory, setJourneyHistory] = useState<JourneyHistoryRecord[]>(() => storage.getJourneyHistory());
  const [favouriteRoutes, setFavouriteRoutes] = useState<FavouriteRoute[]>(() => storage.getFavouriteRoutes());
  const [currentGPS, setCurrentGPS] = useState<Coordinates | null>(null);
  const [gpsError, setGpsError] = useState<GeolocationErrorState | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isNapAlertActive, setIsNapAlertActive] = useState<boolean>(false);
  const [isArrivalModalOpen, setIsArrivalModalOpen] = useState<boolean>(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null);

  const toastTimerRef = useRef<number | null>(null);

  const showToast = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'urgent' = 'info') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    const id = `toast-${Date.now()}`;
    setActiveToast({ id, title, message, type });
    toastTimerRef.current = window.setTimeout(() => {
      setActiveToast(null);
    }, 6000);
  };

  // Check initial GPS once on mount
  useEffect(() => {
    refreshGPS();
  }, []);

  const refreshGPS = async (): Promise<Coordinates | null> => {
    try {
      const coords = await geolocationService.getCurrentPosition();
      setCurrentGPS(coords);
      setGpsError(null);
      return coords;
    } catch (err: any) {
      setGpsError(err);
      return null;
    }
  };

  // Start active GPS tracking when journey is in 'monitoring' state
  useEffect(() => {
    if (activeJourney && activeJourney.status === 'monitoring') {
      setIsTracking(true);
      const watchId = geolocationService.startWatching(
        (coords) => {
          setCurrentGPS(coords);
          setGpsError(null);

          // Feed into AlertEngine
          setActiveJourney((prev) => {
            if (!prev || prev.status !== 'monitoring') return prev;

            const result = alertEngine.processGPSUpdate(
              coords,
              prev,
              alertSettings,
              language,
              voiceLanguage,
              (event: AlertTriggerEvent) => {
                showToast(event.title, event.message, event.isUrgent ? 'urgent' : 'info');
              },
              () => {
                // Nap wake-up callback
                setIsNapAlertActive(true);
                audioEngine.startNapWakeUpAlarm();
              }
            );

            if (result.updatedJourney.status === 'reached') {
              setIsArrivalModalOpen(true);
              // Save to history
              recordJourneyToHistory(result.updatedJourney, 'Completed');
            }

            return result.updatedJourney;
          });
        },
        (err) => {
          setGpsError(err);
          showToast('GPS Error', err.message, 'warning');
        }
      );

      return () => {
        geolocationService.stopWatching();
        setIsTracking(false);
      };
    } else {
      geolocationService.stopWatching();
      setIsTracking(false);
    }
  }, [activeJourney?.status, alertSettings, language, voiceLanguage]);

  const recordJourneyToHistory = (journey: ActiveJourney, status: 'Completed' | 'Cancelled') => {
    const totalSeconds = Math.max(1, Math.round((Date.now() - journey.startTime) / 1000));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const durationFormatted = mins > 0 ? `${mins} min ${secs} sec` : `${secs} sec`;
    const distanceFormatted = (journey.selectedRoute.distance / 1000).toFixed(2) + ' km';

    const record: JourneyHistoryRecord = {
      id: `history-${Date.now()}`,
      sourceName: journey.source.name,
      sourceCoords: [journey.source.lat, journey.source.lng],
      destinationName: journey.destination.name,
      destinationCoords: [journey.destination.lat, journey.destination.lng],
      mode: journey.mode,
      date: new Date(journey.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      startTime: new Date(journey.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationFormatted,
      distanceFormatted,
      status
    };

    storage.addJourneyHistoryRecord(record);
    setJourneyHistory(storage.getJourneyHistory());
  };

  const startJourney = (
    source: LocationPlace,
    destination: LocationPlace,
    mode: TravelMode,
    selectedRoute: RouteOption,
    availableRoutes: RouteOption[]
  ) => {
    const stops = extractStopsFromRoute(selectedRoute, destination);
    const now = Date.now();
    const eta = new Date(now + selectedRoute.duration * 1000);

    const newJourney: ActiveJourney = {
      id: `journey-${now}`,
      source,
      destination,
      mode,
      selectedRoute,
      availableRoutes,
      startTime: now,
      status: 'monitoring',
      currentLocation: currentGPS,
      remainingDistance: selectedRoute.distance,
      remainingDuration: selectedRoute.duration,
      eta,
      initialDuration: selectedRoute.duration,
      progressPercent: 0,
      nextStop: stops[0] || null,
      stops,
      isOffRoute: false,
      isDelayed: false,
      delayMinutes: 0,
      alertsTriggered: {}
    };

    setActiveJourney(newJourney);
    audioEngine.playChime();
    showToast(t.appName, `Started monitoring towards ${destination.name}`, 'success');
  };

  const stopJourney = (completed = false) => {
    if (activeJourney) {
      if (activeJourney.status !== 'reached') {
        recordJourneyToHistory(activeJourney, completed ? 'Completed' : 'Cancelled');
      }
    }
    geolocationService.stopWatching();
    dismissNapAlert();
    setActiveJourney(null);
    setIsArrivalModalOpen(false);
  };

  const pauseJourney = () => {
    if (!activeJourney) return;
    setActiveJourney((prev) => (prev ? { ...prev, status: 'paused' } : null));
    showToast(t.appName, t.pausedStatus, 'info');
  };

  const resumeJourney = () => {
    if (!activeJourney) return;
    setActiveJourney((prev) => (prev ? { ...prev, status: 'monitoring' } : null));
    showToast(t.appName, t.monitoringStatus, 'success');
  };

  const recalculateActiveRoute = async (): Promise<boolean> => {
    if (!activeJourney || !currentGPS) return false;

    showToast(t.appName, t.recalculating, 'info');
    const currentPlace: LocationPlace = {
      id: `gps-current`,
      name: t.unknownPlace,
      displayName: `${currentGPS.lat.toFixed(4)}, ${currentGPS.lng.toFixed(4)}`,
      lat: currentGPS.lat,
      lng: currentGPS.lng
    };

    const routes = await fetchRealRoutes(currentPlace, activeJourney.destination, activeJourney.mode);
    if (routes.length === 0) {
      showToast(t.appName, t.noRouteFound, 'warning');
      return false;
    }

    const newRoute = routes[0];
    const newStops = extractStopsFromRoute(newRoute, activeJourney.destination);
    const now = Date.now();
    const newEta = new Date(now + newRoute.duration * 1000);

    setActiveJourney((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        source: currentPlace,
        selectedRoute: newRoute,
        availableRoutes: routes,
        remainingDistance: newRoute.distance,
        remainingDuration: newRoute.duration,
        eta: newEta,
        progressPercent: 0,
        nextStop: newStops[0] || null,
        stops: newStops,
        isOffRoute: false,
        alertsTriggered: {
          ...prev.alertsTriggered,
          offRoute: false
        }
      };
    });

    audioEngine.playChime();
    showToast(t.appName, 'Route updated successfully', 'success');
    return true;
  };

  const saveAsFavourite = (title: string) => {
    if (!activeJourney) return;
    const fav: FavouriteRoute = {
      id: `fav-${Date.now()}`,
      title: title.trim() || `${activeJourney.source.name} → ${activeJourney.destination.name}`,
      source: activeJourney.source,
      destination: activeJourney.destination,
      mode: activeJourney.mode,
      createdAt: new Date().toISOString()
    };
    storage.saveFavouriteRoute(fav);
    setFavouriteRoutes(storage.getFavouriteRoutes());
    showToast(t.appName, 'Saved to Favourite Routes', 'success');
  };

  const deleteFavourite = (id: string) => {
    storage.deleteFavouriteRoute(id);
    setFavouriteRoutes(storage.getFavouriteRoutes());
  };

  const clearHistory = () => {
    storage.clearJourneyHistory();
    setJourneyHistory([]);
  };

  const dismissNapAlert = () => {
    setIsNapAlertActive(false);
    audioEngine.stopNapWakeUpAlarm();
  };

  const closeArrivalModal = () => {
    setIsArrivalModalOpen(false);
  };

  const openSOSModal = () => {
    setIsSOSModalOpen(true);
  };

  const closeSOSModal = () => {
    setIsSOSModalOpen(false);
  };

  return (
    <JourneyContext.Provider
      value={{
        activeJourney,
        journeyHistory,
        favouriteRoutes,
        currentGPS,
        gpsError,
        isTracking,
        isNapAlertActive,
        isArrivalModalOpen,
        isSOSModalOpen,
        activeToast,
        startJourney,
        stopJourney,
        pauseJourney,
        resumeJourney,
        recalculateActiveRoute,
        saveAsFavourite,
        deleteFavourite,
        clearHistory,
        dismissNapAlert,
        closeArrivalModal,
        openSOSModal,
        closeSOSModal,
        showToast,
        refreshGPS
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
};

export const useJourney = (): JourneyContextType => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};
