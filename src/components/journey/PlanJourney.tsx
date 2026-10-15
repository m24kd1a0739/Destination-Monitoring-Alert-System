import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  Search, 
  ArrowUpDown, 
  Compass, 
  Sparkles, 
  AlertTriangle, 
  AlertCircle,
  RotateCcw,
  Bookmark, 
  Check, 
  Loader2, 
  Map as MapIcon 
} from 'lucide-react';
import { useJourney } from '../../context/JourneyContext';
import { useSettings } from '../../context/SettingsContext';
import { reverseGeocode, searchPlaces } from '../../services/geocoding';
import { fetchRealRoutesWithDiagnostics } from '../../services/routing';
import { LocationPlace, RouteOption, TravelMode } from '../../types';
import { LiveMap } from './LiveMap';
import { RouteAlternativePicker } from './RouteAlternativePicker';
import { TravelModePicker } from './TravelModePicker';

interface PlanJourneyProps {
  onStartSuccess: () => void;
}

export const PlanJourney: React.FC<PlanJourneyProps> = ({ onStartSuccess }) => {
  const { t } = useSettings();
  const { 
    currentGPS, 
    refreshGPS, 
    startJourney, 
    saveAsFavourite, 
    favouriteRoutes, 
    showToast 
  } = useJourney();

  const [sourcePlace, setSourcePlace] = useState<LocationPlace | null>(null);
  const [destPlace, setDestPlace] = useState<LocationPlace | null>(null);
  const [sourceQuery, setSourceQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');

  const [sourceSuggestions, setSourceSuggestions] = useState<LocationPlace[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<LocationPlace[]>([]);
  const [isSearchingSource, setIsSearchingSource] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  const [travelMode, setTravelMode] = useState<TravelMode>('bus');
  const [availableRoutes, setAvailableRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState<'source' | 'dest' | null>(null);
  const [favRouteName, setFavRouteName] = useState('');
  const [showSaveFav, setShowSaveFav] = useState(false);

  const searchDebounceRef = useRef<number | null>(null);

  // Set default source to current location if available
  useEffect(() => {
    if (currentGPS && !sourcePlace) {
      reverseGeocode(currentGPS.lat, currentGPS.lng).then((place) => {
        setSourcePlace(place);
        setSourceQuery(place.name);
      });
    }
  }, [currentGPS]);

  // Handle source search typing
  const handleSourceInputChange = (val: string) => {
    setSourceQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (val.trim().length < 2) {
      setSourceSuggestions([]);
      return;
    }

    setIsSearchingSource(true);
    searchDebounceRef.current = window.setTimeout(async () => {
      const results = await searchPlaces(val, currentGPS ? { lat: currentGPS.lat, lng: currentGPS.lng } : undefined);
      setSourceSuggestions(results);
      setIsSearchingSource(false);
    }, 400);
  };

  // Handle destination search typing
  const handleDestInputChange = (val: string) => {
    setDestQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (val.trim().length < 2) {
      setDestSuggestions([]);
      return;
    }

    setIsSearchingDest(true);
    searchDebounceRef.current = window.setTimeout(async () => {
      const results = await searchPlaces(val, currentGPS ? { lat: currentGPS.lat, lng: currentGPS.lng } : undefined);
      setDestSuggestions(results);
      setIsSearchingDest(false);
    }, 400);
  };

  const handleUseCurrentLocationForSource = async () => {
    const coords = await refreshGPS();
    if (coords) {
      const place = await reverseGeocode(coords.lat, coords.lng);
      setSourcePlace(place);
      setSourceQuery(place.name);
      setSourceSuggestions([]);
    } else {
      showToast('Location Required', t.locationPermissionRequired, 'warning');
    }
  };

  // Swap source & destination
  const handleSwapPlaces = () => {
    const tempPlace = sourcePlace;
    const tempQuery = sourceQuery;

    setSourcePlace(destPlace);
    setSourceQuery(destQuery);

    setDestPlace(tempPlace);
    setDestQuery(tempQuery);
  };

  // Trigger Real Route Calculation whenever source, dest, or travel mode changes
  useEffect(() => {
    if (sourcePlace && destPlace) {
      calculateRoute(sourcePlace, destPlace, travelMode);
    } else {
      setAvailableRoutes([]);
      setSelectedRoute(null);
      setRouteError(null);
    }
  }, [sourcePlace, destPlace, travelMode]);

  const calculateRoute = async (src: LocationPlace, dst: LocationPlace, mode: TravelMode) => {
    setIsCalculatingRoute(true);
    setRouteError(null);
    try {
      const res = await fetchRealRoutesWithDiagnostics(src, dst, mode);
      setAvailableRoutes(res.routes);
      if (res.routes.length > 0) {
        setSelectedRoute(res.routes[0]);
        setRouteError(null);
      } else {
        setSelectedRoute(null);
        const errMsg = res.error || t.noRouteFound;
        setRouteError(errMsg);
        showToast(t.appName, errMsg, 'warning');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch routing data';
      setRouteError(msg);
      showToast(t.appName, msg, 'warning');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleMapLocationPick = async (lat: number, lng: number) => {
    const place = await reverseGeocode(lat, lng);
    if (mapPickerTarget === 'source') {
      setSourcePlace(place);
      setSourceQuery(place.name);
    } else if (mapPickerTarget === 'dest') {
      setDestPlace(place);
      setDestQuery(place.name);
    }
    setMapPickerTarget(null);
  };

  const handleStartJourney = () => {
    if (!sourcePlace || !destPlace || !selectedRoute) return;
    startJourney(sourcePlace, destPlace, travelMode, selectedRoute, availableRoutes);
    onStartSuccess();
  };

  const handleSaveFav = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourcePlace || !destPlace) return;
    const title = favRouteName.trim() || `${sourcePlace.name} → ${destPlace.name}`;
    saveAsFavourite(title);
    setShowSaveFav(false);
    setFavRouteName('');
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-brand-400" />
            <span>{t.planJourney}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Search real bus stops, select travel mode & calculate dynamic ETA.
          </p>
        </div>
      </div>

      {/* Route Inputs Card */}
      <div className="bg-dark-surface border border-dark-border rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 relative">
        
        {/* Source Field */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
              <span>{t.source}</span>
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleUseCurrentLocationForSource}
                className="text-[11px] text-brand-400 hover:text-brand-300 font-medium flex items-center space-x-1"
              >
                <Compass className="w-3 h-3" />
                <span>{t.useCurrentLocation}</span>
              </button>
              <button
                type="button"
                onClick={() => setMapPickerTarget(mapPickerTarget === 'source' ? null : 'source')}
                className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                  mapPickerTarget === 'source' 
                    ? 'bg-brand-500 text-white border-brand-500' 
                    : 'text-slate-400 hover:text-slate-200 border-dark-border'
                }`}
              >
                {t.selectOnMap}
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={sourceQuery}
              onChange={(e) => handleSourceInputChange(e.target.value)}
              placeholder={t.searchSource}
              className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            {isSearchingSource && (
              <Loader2 className="w-4 h-4 absolute right-3.5 top-3.5 text-brand-400 animate-spin" />
            )}
          </div>

          {/* Source Suggestions Dropdown */}
          {sourceSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden divide-y divide-dark-border">
              {sourceSuggestions.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => {
                    setSourcePlace(place);
                    setSourceQuery(place.name);
                    setSourceSuggestions([]);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-dark-hover flex items-start space-x-2 text-xs transition-colors"
                >
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{place.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{place.displayName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button Divider */}
        <div className="flex items-center justify-center -my-2 relative z-10">
          <button
            type="button"
            onClick={handleSwapPlaces}
            className="p-1.5 rounded-full bg-dark-card border border-dark-border text-slate-400 hover:text-white hover:bg-dark-hover transition-all active:scale-90 shadow-md"
            title="Swap Source & Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Field */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>
              <span>{t.destination}</span>
            </label>
            <button
              type="button"
              onClick={() => setMapPickerTarget(mapPickerTarget === 'dest' ? null : 'dest')}
              className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                mapPickerTarget === 'dest' 
                  ? 'bg-brand-500 text-white border-brand-500' 
                  : 'text-slate-400 hover:text-slate-200 border-dark-border'
              }`}
            >
              {t.selectOnMap}
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={destQuery}
              onChange={(e) => handleDestInputChange(e.target.value)}
              placeholder={t.searchDestination}
              className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            {isSearchingDest && (
              <Loader2 className="w-4 h-4 absolute right-3.5 top-3.5 text-brand-400 animate-spin" />
            )}
          </div>

          {/* Destination Suggestions Dropdown */}
          {destSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden divide-y divide-dark-border">
              {destSuggestions.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => {
                    setDestPlace(place);
                    setDestQuery(place.name);
                    setDestSuggestions([]);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-dark-hover flex items-start space-x-2 text-xs transition-colors"
                >
                  <MapPin className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{place.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{place.displayName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Travel Mode Picker */}
        <TravelModePicker
          selectedMode={travelMode}
          onChangeMode={(mode) => setTravelMode(mode)}
          transitNotice={selectedRoute?.transitNotice}
        />

      </div>

      {/* Live Map Preview & Picker */}
      <LiveMap
        currentGPS={currentGPS}
        source={sourcePlace}
        destination={destPlace}
        selectedRoute={selectedRoute}
        onSelectMapLocation={mapPickerTarget ? handleMapLocationPick : undefined}
        isInteractivePicker={!!mapPickerTarget}
      />

      {/* Loading Route Spinner */}
      {isCalculatingRoute && (
        <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border flex items-center justify-center space-x-2 text-xs text-brand-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t.calculatingRoute}</span>
        </div>
      )}

      {/* Route Calculation Failure / Provider Diagnostic Notice */}
      {routeError && !isCalculatingRoute && sourcePlace && destPlace && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start sm:items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="font-semibold text-white">Route Calculation Unavailable</p>
              <p className="text-[11px] text-amber-300/90">{routeError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => calculateRoute(sourcePlace, destPlace, travelMode)}
            className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Route</span>
          </button>
        </div>
      )}

      {/* Route Alternatives */}
      {availableRoutes.length > 0 && selectedRoute && (
        <RouteAlternativePicker
          routes={availableRoutes}
          selectedRouteId={selectedRoute.id}
          onSelectRoute={(r) => setSelectedRoute(r)}
        />
      )}

      {/* Start Journey Bar */}
      {selectedRoute && (
        <div className="sticky bottom-20 md:bottom-6 z-30 bg-dark-surface/95 backdrop-blur-xl border border-brand-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-extrabold text-white">
                {Math.ceil(selectedRoute.duration / 60)} min
              </span>
              <span className="text-xs text-slate-400">({(selectedRoute.distance / 1000).toFixed(1)} km)</span>
            </div>
            <p className="text-xs text-emerald-400 font-medium">
              Arrival: {new Date(Date.now() + selectedRoute.duration * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowSaveFav(true)}
              className="p-3 rounded-2xl bg-dark-card hover:bg-dark-hover text-slate-300 border border-dark-border transition-colors"
              title={t.saveFavourite}
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleStartJourney}
              className="flex-1 sm:flex-none py-3.5 px-8 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-xl shadow-brand-500/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              <Navigation className="w-4 h-4" />
              <span>{t.startJourneyBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* Save Favourite Dialog */}
      {showSaveFav && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-dark-surface border border-dark-border rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">{t.saveFavourite}</h3>
            <p className="text-xs text-slate-400 mb-4">{t.routeName}</p>
            <form onSubmit={handleSaveFav} className="space-y-4">
              <input
                type="text"
                value={favRouteName}
                onChange={(e) => setFavRouteName(e.target.value)}
                placeholder="e.g. Daily Commute"
                className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                autoFocus
              />
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSaveFav(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-dark-card text-xs text-slate-300 border border-dark-border"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs text-white font-bold"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
