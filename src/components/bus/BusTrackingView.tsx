import React, { useEffect, useRef, useState } from 'react';
import { 
  Bus, 
  Search, 
  MapPin, 
  Navigation, 
  ArrowLeftRight, 
  Radio, 
  RotateCw, 
  Share2, 
  CheckCircle2, 
  CircleDot, 
  Bell, 
  Volume2, 
  Sparkles, 
  AlertCircle, 
  AlertTriangle,
  ChevronLeft,
  Flame,
  ArrowRight,
  Clock,
  Gauge,
  ShieldCheck,
  Play,
  Pause,
  Compass,
  Layers,
  Key
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useJourney } from '../../context/JourneyContext';
import { BusInfo, BusStop, JourneyHistoryRecord } from '../../types';
import { busService } from '../../services/busService';
import { 
  gpsBackendService, 
  BusLocationResponse, 
  RegisteredBusRecord 
} from '../../services/gpsBackendService';
import { alertEngine } from '../../services/alertEngine';
import { audioEngine } from '../../services/audioEngine';
import { voiceEngine } from '../../i18n/voice';
import { storage } from '../../services/storage';
import { BusCard } from './BusCard';
import { BusMap } from './BusMap';
import { BusShareModal } from './BusShareModal';
import { AuthorizedReporterModal } from './AuthorizedReporterModal';

type FleetViewMode = 'live' | 'demo';

export const BusTrackingView: React.FC = () => {
  const { t, language, voiceLanguage, alertSettings } = useSettings();
  const { showToast } = useJourney();

  // Mode: Real Live Fleet GPS vs. Demonstration Simulator
  const [fleetMode, setFleetMode] = useState<FleetViewMode>('live');

  // Search & Navigation States
  const [searchMode, setSearchMode] = useState<'route' | 'number'>('route');
  const [fromInput, setFromInput] = useState<string>('Vizianagaram');
  const [toInput, setToInput] = useState<string>('Parvathipuram');
  const [busNumberInput, setBusNumberInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<BusInfo[]>([]);
  const [registeredFleet, setRegisteredFleet] = useState<RegisteredBusRecord[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(true);

  // Active Tracking State
  const [activeBus, setActiveBus] = useState<BusInfo | null>(null);
  const [activeLiveStatus, setActiveLiveStatus] = useState<BusLocationResponse | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isReporterModalOpen, setIsReporterModalOpen] = useState<boolean>(false);
  const [arrivalCelebrated, setArrivalCelebrated] = useState<boolean>(false);

  // Alert Trigger Tracking for Active Bus
  const alertsFiredRef = useRef<{ fiveMin?: boolean; twoMin?: boolean; reached?: boolean }>({});
  const autoSimTimerRef = useRef<number | null>(null);

  // Load Registered fleet & initial route search
  useEffect(() => {
    const fleet = gpsBackendService.listRegisteredBuses();
    setRegisteredFleet(fleet);

    const results = busService.searchBuses('Vizianagaram', 'Parvathipuram');
    setSearchResults(results);
  }, []);

  // Poll live GPS telemetry when tracking an active bus in 'live' mode
  useEffect(() => {
    if (!activeBus) return;

    const checkLiveTelemetry = () => {
      const response = gpsBackendService.getBusLocation(activeBus.id || activeBus.busNumber);
      setActiveLiveStatus(response);

      // If genuine live coordinates exist, update activeBus location
      if (response.location && response.status !== 'BUS_NOT_FOUND') {
        setActiveBus((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            currentLocation: {
              name: `Live: ±${response.location?.accuracyMeters || 10}m (GPS Verified)`,
              lat: response.location!.latitude,
              lng: response.location!.longitude
            },
            speedKmH: response.location!.speedKmH,
            lastUpdated: `${response.location!.ageSeconds}s ago`
          };
        });
      }
    };

    checkLiveTelemetry();
    const intervalId = window.setInterval(checkLiveTelemetry, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
  }, [activeBus?.id, fleetMode]);

  // Handle Route Search
  const handleSearchRoute = (from = fromInput, to = toInput) => {
    const results = busService.searchBuses(from, to);
    setSearchResults(results);
    setHasSearched(true);
    if (results.length === 0) {
      showToast(t.appName, t.noBusesFound, 'info');
    }
  };

  // Handle Bus Number Search
  const handleSearchBusNumber = (number = busNumberInput) => {
    if (!number.trim()) {
      showToast(t.appName, 'Please enter a bus number', 'warning');
      return;
    }

    // First check registered backend fleet
    const registeredBus = gpsBackendService.findBus(number);
    if (registeredBus) {
      const simMatch = busService.getBusByNumber(registeredBus.busNumber) || {
        id: registeredBus.id,
        busNumber: registeredBus.busNumber,
        busName: registeredBus.busName,
        busType: registeredBus.busType as any,
        operator: registeredBus.operator,
        routeId: registeredBus.routeId,
        routeName: registeredBus.routeName,
        source: { id: 'src', name: registeredBus.source.name, displayName: registeredBus.source.name, lat: registeredBus.source.lat, lng: registeredBus.source.lng },
        destination: { id: 'dst', name: registeredBus.destination.name, displayName: registeredBus.destination.name, lat: registeredBus.destination.lat, lng: registeredBus.destination.lng },
        stops: [
          { id: 's1', name: registeredBus.source.name, lat: registeredBus.source.lat, lng: registeredBus.source.lng, distanceFromStartKm: 0, etaMinutes: 0, passed: true },
          { id: 's2', name: registeredBus.destination.name, lat: registeredBus.destination.lat, lng: registeredBus.destination.lng, distanceFromStartKm: 60, etaMinutes: 60, passed: false }
        ],
        currentStopIndex: 0,
        currentLocation: { name: 'Awaiting verified GPS feed', lat: registeredBus.source.lat, lng: registeredBus.source.lng },
        nextStop: { id: 's2', name: registeredBus.destination.name, lat: registeredBus.destination.lat, lng: registeredBus.destination.lng, distanceFromStartKm: 60, etaMinutes: 60, passed: false },
        expectedArrivalTime: '--:--',
        estimatedJourneyDuration: '--',
        distanceRemainingKm: 60,
        delayMinutes: 0,
        status: 'on_time',
        speedKmH: 0,
        polylineCoordinates: [],
        lastUpdated: 'No GPS received'
      };

      setSearchResults([simMatch]);
      setHasSearched(true);
      handleTrackBus(simMatch);
      return;
    }

    const found = busService.getBusByNumber(number);
    if (found) {
      setSearchResults([found]);
      setHasSearched(true);
      handleTrackBus(found);
    } else {
      setSearchResults([]);
      setHasSearched(true);
      showToast(t.appName, t.busNotFound, 'warning');
    }
  };

  // Swap Origin and Destination
  const handleSwapLocations = () => {
    const temp = fromInput;
    setFromInput(toInput);
    setToInput(temp);
    handleSearchRoute(toInput, temp);
  };

  // Select Quick Popular Route
  const handleSelectPopularRoute = (from: string, to: string) => {
    setFromInput(from);
    setToInput(to);
    setSearchMode('route');
    handleSearchRoute(from, to);
  };

  // Start tracking a specific bus
  const handleTrackBus = (bus: BusInfo) => {
    setActiveBus(bus);
    const liveStatus = gpsBackendService.getBusLocation(bus.id || bus.busNumber);
    setActiveLiveStatus(liveStatus);

    const defaultStop = bus.stops[bus.stops.length - 1];
    setSelectedStopId(defaultStop ? defaultStop.id : null);
    alertsFiredRef.current = {};
    setArrivalCelebrated(false);
    audioEngine.playChime();
    showToast(t.whereIsMyBus, `Tracking ${bus.busNumber} (${bus.routeName})`, 'success');
  };

  // Stop / Exit tracking view
  const handleBackToSearch = () => {
    setIsAutoSimulating(false);
    if (autoSimTimerRef.current) {
      clearInterval(autoSimTimerRef.current);
    }
    setActiveBus(null);
    setActiveLiveStatus(null);
  };

  // Select a specific bus stop as "My Stop"
  const handleSelectMyStop = (stop: BusStop) => {
    setSelectedStopId(stop.id);
    alertsFiredRef.current = {};
    audioEngine.playTone(880, 150, 'sine', 0.2);
    showToast(t.myStopSelected, `${t.myStop}: ${stop.name}`, 'success');
  };

  // Check and fire alerts based on bus distance to target "My Stop"
  const checkBusAlerts = (bus: BusInfo, stopId: string | null) => {
    if (!stopId) return;
    const targetStop = bus.stops.find((s) => s.id === stopId) || bus.stops[bus.stops.length - 1];
    if (!targetStop) return;

    const etaMinutes = targetStop.etaMinutes;
    const isTargetPassed = targetStop.passed;

    // Destination reached
    if ((isTargetPassed || etaMinutes <= 0 || bus.status === 'arrived') && !alertsFiredRef.current.reached) {
      alertsFiredRef.current.reached = true;
      audioEngine.playArrivalCelebration();
      if (alertSettings.vibrationEnabled) alertEngine.triggerVibration([500, 200, 500, 200, 800]);

      const arrivedText = t.busArrivedAtStop(bus.busNumber, targetStop.name);
      if (alertSettings.notificationsEnabled) {
        alertEngine.triggerNotification(t.arrived, arrivedText);
      }
      if (alertSettings.voiceEnabled) {
        voiceEngine.speak(arrivedText, voiceLanguage);
      }

      showToast(t.arrived, arrivedText, 'urgent');
      setArrivalCelebrated(true);

      const historyRecord: JourneyHistoryRecord = {
        id: `history-bus-${Date.now()}`,
        sourceName: `${bus.busNumber} (${bus.source.name})`,
        sourceCoords: [bus.source.lat, bus.source.lng],
        destinationName: targetStop.name,
        destinationCoords: [targetStop.lat, targetStop.lng],
        mode: 'bus',
        date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        startTime: new Date(Date.now() - 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        durationFormatted: bus.estimatedJourneyDuration,
        distanceFormatted: `${bus.distanceRemainingKm} km`,
        status: 'Completed'
      };
      storage.addJourneyHistoryRecord(historyRecord);
      return;
    }

    // Urgent 2-Minute Alert
    if (etaMinutes > 0 && etaMinutes <= 2.5 && !alertsFiredRef.current.twoMin && !alertsFiredRef.current.reached) {
      alertsFiredRef.current.twoMin = true;
      audioEngine.playUrgentAlert();
      if (alertSettings.vibrationEnabled) alertEngine.triggerVibration([400, 200, 400, 200, 600]);

      const alert2Text = t.bus2MinAlert(bus.busNumber, targetStop.name);
      if (alertSettings.notificationsEnabled) {
        alertEngine.triggerNotification('Urgent Bus Alert (2 Min)', alert2Text);
      }
      if (alertSettings.voiceEnabled) {
        voiceEngine.speak(alert2Text, voiceLanguage);
      }
      showToast('2-Minute Alert', alert2Text, 'urgent');
      return;
    }

    // 5-Minute Advance Alert
    if (etaMinutes > 2.5 && etaMinutes <= 5.5 && !alertsFiredRef.current.fiveMin && !alertsFiredRef.current.twoMin) {
      alertsFiredRef.current.fiveMin = true;
      audioEngine.playChime();
      if (alertSettings.vibrationEnabled) alertEngine.triggerVibration([300, 200, 300]);

      const alert5Text = t.bus5MinAlert(bus.busNumber, targetStop.name);
      if (alertSettings.notificationsEnabled) {
        alertEngine.triggerNotification('Bus Approaching (5 Min)', alert5Text);
      }
      if (alertSettings.voiceEnabled) {
        voiceEngine.speak(alert5Text, voiceLanguage);
      }
      showToast('5-Minute Alert', alert5Text, 'info');
    }
  };

  // Step / Refresh bus location
  const handleRefreshBusLocation = () => {
    if (!activeBus) return;
    setIsRefreshing(true);

    if (fleetMode === 'demo') {
      const updated = busService.simulateBusMovement(activeBus);
      setActiveBus(updated);
      checkBusAlerts(updated, selectedStopId);
    } else {
      const response = gpsBackendService.getBusLocation(activeBus.id || activeBus.busNumber);
      setActiveLiveStatus(response);
      if (response.location) {
        setActiveBus((prev) =>
          prev
            ? {
                ...prev,
                currentLocation: {
                  name: `Live: ±${response.location!.accuracyMeters || 10}m`,
                  lat: response.location!.latitude,
                  lng: response.location!.longitude
                },
                speedKmH: response.location!.speedKmH,
                lastUpdated: `${response.location!.ageSeconds}s ago`
              }
            : null
        );
      }
    }

    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // Auto-simulation ticker (Only in Demo Mode)
  useEffect(() => {
    if (fleetMode === 'demo' && isAutoSimulating && activeBus && activeBus.status !== 'arrived') {
      autoSimTimerRef.current = window.setInterval(() => {
        setActiveBus((prev) => {
          if (!prev || prev.status === 'arrived') return prev;
          const next = busService.simulateBusMovement(prev);
          checkBusAlerts(next, selectedStopId);
          return next;
        });
      }, 4000);

      return () => {
        if (autoSimTimerRef.current) {
          clearInterval(autoSimTimerRef.current);
        }
      };
    } else {
      if (autoSimTimerRef.current) {
        clearInterval(autoSimTimerRef.current);
      }
    }
  }, [isAutoSimulating, activeBus?.id, selectedStopId, fleetMode]);

  const selectedStop = activeBus?.stops.find((s) => s.id === selectedStopId) || null;

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      
      {/* 1. Header Banner & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center space-x-3.5">
          {activeBus ? (
            <button
              onClick={handleBackToSearch}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 flex items-center justify-center shadow-sm"
              title={t.back}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 flex-shrink-0">
              <Bus className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {activeBus ? activeBus.busNumber : t.whereIsMyBus}
              </h2>

              {fleetMode === 'live' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse mr-1"></span>
                  Verified Live Telemetry
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Demonstration Simulator
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeBus
                ? `${activeBus.busName} • ${activeBus.routeName}`
                : 'Track genuine transit GPS or preview routes via simulator.'}
            </p>
          </div>
        </div>

        {/* Mode Selector & Driver Transmitter Trigger */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => {
                setFleetMode('live');
                setIsAutoSimulating(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                fleetMode === 'live'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Fleet
            </button>
            <button
              onClick={() => setFleetMode('demo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                fleetMode === 'demo'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Demo Simulator
            </button>
          </div>

          {/* Driver Device Transmitter Button */}
          <button
            onClick={() => setIsReporterModalOpen(true)}
            className="flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm"
            title="Launch Driver / Device Transmitter"
          >
            <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span className="hidden sm:inline">Transmitter</span>
          </button>
        </div>
      </div>

      {/* 2. Demonstration Banner Notice (if in demo mode) */}
      {fleetMode === 'demo' && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Demo Simulator Active:</strong> Simulated movement and road speeds are for project demonstration and testing. Switch to "Live Fleet" for genuine verified GPS telemetry.
            </span>
          </div>
        </div>
      )}

      {/* 3. SEARCH INTERFACE (When no bus is actively selected) */}
      {!activeBus && (
        <div className="space-y-6">
          
          {/* Search Mode Toggle Tabs */}
          <div className="flex rounded-2xl bg-slate-900 p-1.5 border border-slate-800 max-w-md mx-auto shadow-md">
            <button
              onClick={() => setSearchMode('route')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                searchMode === 'route'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>{t.searchByRoute}</span>
            </button>

            <button
              onClick={() => setSearchMode('number')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                searchMode === 'number'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>{t.searchByBusNumber}</span>
            </button>
          </div>

          {/* Search Inputs Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            {searchMode === 'route' ? (
              <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
                
                {/* From Location */}
                <div className="md:col-span-5 relative">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {t.fromLocation}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-400" />
                    <input
                      type="text"
                      value={fromInput}
                      onChange={(e) => setFromInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchRoute()}
                      placeholder="e.g. Vizianagaram"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Swap Button */}
                <div className="md:col-span-1 flex items-center justify-center pt-5">
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 shadow-sm"
                    title="Swap locations"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* To Location */}
                <div className="md:col-span-5 relative">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {t.toLocation}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-red-400" />
                    <input
                      type="text"
                      value={toInput}
                      onChange={(e) => setToInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchRoute()}
                      placeholder="e.g. Parvathipuram"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-11 pt-2 flex justify-end">
                  <button
                    onClick={() => handleSearchRoute()}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition-all active:scale-95"
                  >
                    <Search className="w-4 h-4" />
                    <span>{t.searchBusRoute}</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  {t.enterBusNumber}
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Bus className="w-4 h-4 absolute left-3.5 top-3.5 text-brand-400" />
                    <input
                      type="text"
                      value={busNumberInput}
                      onChange={(e) => setBusNumberInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchBusNumber()}
                      placeholder="e.g. AP 35 Z 4512 or 4512"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                    />
                  </div>
                  <button
                    onClick={() => handleSearchBusNumber()}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition-all active:scale-95"
                  >
                    <Search className="w-4 h-4" />
                    <span>Track Bus</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Popular Routes */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              Popular State Transit Corridors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {busService.getPopularRoutes().map((route, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPopularRoute(route.from, route.to)}
                  className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all active:scale-95 shadow-sm"
                >
                  <p className="text-xs font-bold text-white truncate">{route.label}</p>
                  <p className="text-[10px] text-teal-400 mt-0.5">{route.count} Active Fleet Buses</p>
                </button>
              ))}
            </div>
          </div>

          {/* Search Results List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Available Fleet Results ({searchResults.length})
              </h3>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((bus) => (
                  <BusCard
                    key={bus.id}
                    bus={bus}
                    onTrackBus={handleTrackBus}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-slate-900 border border-slate-800 rounded-3xl">
                <Bus className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-300">No buses matching query</p>
                <p className="text-xs text-slate-500 mt-1">Try another route or search by bus registration plate.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 4. ACTIVE BUS TRACKING VIEW */}
      {activeBus && (
        <div className="space-y-6">
          
          {/* Top Status & Telemetry Metrics Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-xl bg-brand-500/20 text-brand-300 font-extrabold text-sm border border-brand-500/30">
                    {activeBus.busNumber}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    {activeBus.busType}
                  </span>

                  {/* Truthful Live Freshness Badge */}
                  {fleetMode === 'live' ? (
                    activeLiveStatus?.status === 'LIVE' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        LIVE SIGNAL ({activeLiveStatus.location?.ageSeconds}s)
                      </span>
                    ) : activeLiveStatus?.status === 'STALE' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        STALE SIGNAL ({activeLiveStatus.location?.ageSeconds}s ago)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-slate-400" />
                        AWAITING GPS TRANSMITTER
                      </span>
                    )
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      DEMO SIMULATION
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mt-1.5">
                  {activeBus.source.name} → {activeBus.destination.name}
                </h3>
              </div>

              {/* Selected "My Stop" Callout Badge */}
              {selectedStop && (
                <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-3 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                    ⭐
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                      {t.myStop}
                    </span>
                    <span className="text-xs font-bold text-white block">
                      {selectedStop.name}
                    </span>
                    <span className="text-[10px] text-amber-200/80">
                      ETA: ~{selectedStop.etaMinutes} mins away
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* If live data is unavailable, display truthful prompt */}
            {fleetMode === 'live' && activeLiveStatus?.status === 'DATA_UNAVAILABLE' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
                <div className="flex items-start sm:items-center gap-2.5">
                  <Radio className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5 sm:mt-0 animate-pulse" />
                  <div>
                    <p className="font-semibold text-white">No active GPS transmission received</p>
                    <p className="text-[11px] text-slate-400">{activeLiveStatus.message}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReporterModalOpen(true)}
                  className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Launch Driver Transmitter</span>
                </button>
              </div>
            )}

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>{t.currentLocation}</span>
                </div>
                <div className="text-xs font-bold text-slate-200 truncate mt-1" title={activeBus.currentLocation.name}>
                  {activeBus.currentLocation.name}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                  <CircleDot className="w-3 h-3 text-teal-400" />
                  <span>{t.nextStop}</span>
                </div>
                <div className="text-xs font-bold text-teal-400 truncate mt-1" title={activeBus.nextStop?.name}>
                  {activeBus.nextStop?.name || 'In transit'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{t.estimatedArrival}</span>
                </div>
                <div className="text-xs font-bold text-emerald-400 mt-1">
                  {activeBus.expectedArrivalTime} ({activeBus.estimatedJourneyDuration})
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-amber-400" />
                  <span>{t.liveBusSpeed}</span>
                </div>
                <div className="text-xs font-bold text-slate-200 mt-1">
                  {activeBus.speedKmH} km/h • {activeBus.distanceRemainingKm} km rem.
                </div>
              </div>
            </div>

            {/* Tracking Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefreshBusLocation}
                  disabled={isRefreshing}
                  className="flex items-center space-x-2 py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                >
                  <RotateCw className={`w-3.5 h-3.5 text-teal-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{t.refreshBusLocation}</span>
                </button>

                {fleetMode === 'demo' && (
                  <button
                    onClick={() => setIsAutoSimulating(!isAutoSimulating)}
                    disabled={activeBus.status === 'arrived'}
                    className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all border active:scale-95 disabled:opacity-50 ${
                      isAutoSimulating
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    {isAutoSimulating ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Simulation Active</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-slate-400" />
                        <span>Run Demo Simulation</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsReporterModalOpen(true)}
                  className="flex items-center space-x-2 py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-bold shadow-sm transition-all"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Driver Transmitter</span>
                </button>

                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center space-x-2 py-2 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/25 transition-all active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t.shareBusStatus}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Interactive Bus Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-brand-400" />
                <span>{fleetMode === 'live' ? 'Live Telemetry Map' : 'Demonstration Route Map'}</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                {t.lastUpdated}: {activeBus.lastUpdated}
              </span>
            </div>

            <BusMap
              bus={activeBus}
              selectedStopId={selectedStopId}
              isDemo={fleetMode === 'demo'}
            />
          </div>

          {/* Ordered Bus Stop Sequence List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>{t.stopSequence} ({activeBus.stops.length} Stops)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tap "Set as My Stop" on any stop to receive advance arrival alerts in {voiceLanguage}.
                </p>
              </div>
            </div>

            {/* Stops Timeline */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {activeBus.stops.map((stop, idx) => {
                const isMyStop = selectedStopId === stop.id;
                const isNext = activeBus.nextStop?.id === stop.id;
                const isPassed = stop.passed;
                const isDest = idx === activeBus.stops.length - 1;

                return (
                  <div key={stop.id} className="relative flex items-center justify-between gap-3 text-xs">
                    
                    {/* Timeline Pin Indicator */}
                    <div className="absolute -left-6">
                      {isPassed ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : isMyStop ? (
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/50 -ml-0.5">
                          <span className="text-xs">⭐</span>
                        </div>
                      ) : isNext ? (
                        <div className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/50 animate-pulse">
                          <CircleDot className="w-3.5 h-3.5" />
                        </div>
                      ) : isDest ? (
                        <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 ml-0.5"></div>
                      )}
                    </div>

                    {/* Stop Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold truncate ${isMyStop ? 'text-amber-400 font-extrabold' : isNext ? 'text-teal-400' : isPassed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                          {stop.name}
                        </span>
                        {isDest && (
                          <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 rounded text-[9px] font-bold">
                            DESTINATION
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {stop.distanceFromStartKm} km from origin • {isPassed ? 'Passed' : `~${stop.etaMinutes} min away`}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {isMyStop ? (
                        <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[11px] flex items-center space-x-1 shadow-sm">
                          <span>⭐</span>
                          <span>My Stop Active</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectMyStop(stop)}
                          disabled={isPassed}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-medium text-[11px] transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                          Set as My Stop
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* Authorized GPS Reporter Modal */}
      {isReporterModalOpen && (
        <AuthorizedReporterModal
          onClose={() => setIsReporterModalOpen(false)}
          onUpdateSent={() => {
            if (activeBus) {
              const res = gpsBackendService.getBusLocation(activeBus.id || activeBus.busNumber);
              setActiveLiveStatus(res);
            }
          }}
        />
      )}

      {/* Share Modal */}
      {isShareModalOpen && activeBus && (
        <BusShareModal
          bus={activeBus}
          selectedStop={selectedStop}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

    </div>
  );
};
