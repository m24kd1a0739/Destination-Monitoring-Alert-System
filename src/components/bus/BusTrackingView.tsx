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
  ChevronLeft,
  Flame,
  ArrowRight,
  Clock,
  Gauge,
  ShieldCheck,
  Play,
  Pause
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useJourney } from '../../context/JourneyContext';
import { BusInfo, BusStop, JourneyHistoryRecord } from '../../types';
import { busService } from '../../services/busService';
import { alertEngine } from '../../services/alertEngine';
import { audioEngine } from '../../services/audioEngine';
import { voiceEngine } from '../../i18n/voice';
import { storage } from '../../services/storage';
import { BusCard } from './BusCard';
import { BusMap } from './BusMap';
import { BusShareModal } from './BusShareModal';

export const BusTrackingView: React.FC = () => {
  const { t, language, voiceLanguage, alertSettings } = useSettings();
  const { showToast } = useJourney();

  // Search & Navigation States
  const [searchMode, setSearchMode] = useState<'route' | 'number'>('route');
  const [fromInput, setFromInput] = useState<string>('Vizianagaram');
  const [toInput, setToInput] = useState<string>('Parvathipuram');
  const [busNumberInput, setBusNumberInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<BusInfo[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(true);

  // Active Tracking State
  const [activeBus, setActiveBus] = useState<BusInfo | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [arrivalCelebrated, setArrivalCelebrated] = useState<boolean>(false);

  // Alert Trigger Tracking for Active Bus
  const alertsFiredRef = useRef<{ fiveMin?: boolean; twoMin?: boolean; reached?: boolean }>({});
  const autoSimTimerRef = useRef<number | null>(null);

  // Initial load: Search for default route
  useEffect(() => {
    const results = busService.searchBuses('Vizianagaram', 'Parvathipuram');
    setSearchResults(results);
  }, []);

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
    const found = busService.getBusByNumber(number);
    if (found) {
      setSearchResults([found]);
      setHasSearched(true);
      // Directly track found bus
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
    // By default, set final destination as "My Stop" if none selected
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
  };

  // Select a specific bus stop as "My Stop"
  const handleSelectMyStop = (stop: BusStop) => {
    setSelectedStopId(stop.id);
    alertsFiredRef.current = {}; // reset alert state for newly selected stop
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
    const isDestination = targetStop.id === bus.stops[bus.stops.length - 1].id;

    // 1. Destination Reached / My Stop Arrived
    if ((isTargetPassed || etaMinutes <= 0 || bus.status === 'arrived') && !alertsFiredRef.current.reached) {
      alertsFiredRef.current.reached = true;
      audioEngine.playArrivalCelebration();
      if (alertSettings.vibrationEnabled) alertEngine.triggerVibration([500, 200, 500, 200, 800]);

      const arrivedText = t.busArrivedAtStop(bus.busNumber, targetStop.name);

      if (alertSettings.notificationsEnabled) {
        alertEngine.triggerNotification(t.arrived, arrivedText);
      }
      if (alertSettings.voiceEnabled) {
        const speechRes = voiceEngine.speak(arrivedText, voiceLanguage);
        if (!speechRes.success) {
          showToast(t.appName, speechRes.message || 'Voice alert note', 'info');
        }
      }

      showToast(t.arrived, arrivedText, 'urgent');
      setArrivalCelebrated(true);

      // Record to history
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

    // 2. Urgent 2-Minute Advance Alert
    if (etaMinutes > 0 && etaMinutes <= 2.5 && !alertsFiredRef.current.twoMin && !alertsFiredRef.current.reached) {
      alertsFiredRef.current.twoMin = true;
      audioEngine.playUrgentAlert();
      if (alertSettings.vibrationEnabled) alertEngine.triggerVibration([400, 200, 400, 200, 600]);

      const alert2Text = t.bus2MinAlert(bus.busNumber, targetStop.name);

      if (alertSettings.notificationsEnabled) {
        alertEngine.triggerNotification('Urgent Bus Alert (2 Min)', alert2Text);
      }
      if (alertSettings.voiceEnabled) {
        const speechRes = voiceEngine.speak(alert2Text, voiceLanguage);
        if (!speechRes.success) {
          showToast(t.appName, speechRes.message || 'Voice alert note', 'info');
        }
      }

      showToast('2-Minute Alert', alert2Text, 'urgent');
      return;
    }

    // 3. 5-Minute Advance Alert
    if (etaMinutes > 2.5 && etaMinutes <= 5.5 && !alertsFiredRef.current.fiveMin && !alertsFiredRef.current.twoMin) {
      alertsFiredRef.current.fiveMin = true;
      audioEngine.playChime();
      if (alertSettings.vibrationEnabled) alertEngine.triggerVibration([300, 200, 300]);

      const alert5Text = t.bus5MinAlert(bus.busNumber, targetStop.name);

      if (alertSettings.notificationsEnabled) {
        alertEngine.triggerNotification('Bus Approaching (5 Min)', alert5Text);
      }
      if (alertSettings.voiceEnabled) {
        const speechRes = voiceEngine.speak(alert5Text, voiceLanguage);
        if (!speechRes.success) {
          showToast(t.appName, speechRes.message || 'Voice alert note', 'info');
        }
      }

      showToast('5-Minute Alert', alert5Text, 'info');
    }
  };

  // Step / Refresh bus location
  const handleRefreshBusLocation = () => {
    if (!activeBus) return;
    setIsRefreshing(true);
    const updated = busService.simulateBusMovement(activeBus);
    setActiveBus(updated);
    checkBusAlerts(updated, selectedStopId);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // Auto-simulation ticker
  useEffect(() => {
    if (isAutoSimulating && activeBus && activeBus.status !== 'arrived') {
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
  }, [isAutoSimulating, activeBus?.id, selectedStopId]);

  const selectedStop = activeBus?.stops.find((s) => s.id === selectedStopId) || null;

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      
      {/* 1. Header Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-surface border border-dark-border rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center space-x-3.5">
          {activeBus ? (
            <button
              onClick={handleBackToSearch}
              className="p-2.5 rounded-2xl bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-300 hover:text-white transition-all active:scale-95 flex items-center justify-center"
              title={t.back}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 flex-shrink-0">
              <Bus className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {activeBus ? activeBus.busNumber : t.whereIsMyBus}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/15 text-brand-400 border border-brand-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {t.demoLiveDataBadge}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeBus ? `${activeBus.busName} • ${activeBus.routeName}` : t.demoDataNotice}
            </p>
          </div>
        </div>

        {/* Global Language / Voice Info indicator */}
        <div className="flex items-center space-x-2 text-xs bg-dark-bg/80 border border-dark-border/80 px-3 py-1.5 rounded-2xl text-slate-300 self-start sm:self-auto">
          <Volume2 className="w-3.5 h-3.5 text-brand-400" />
          <span>Voice: <strong className="text-white capitalize">{voiceLanguage}</strong></span>
        </div>
      </div>

      {/* 2. SEARCH INTERFACE (Shown when no bus is actively selected) */}
      {!activeBus && (
        <div className="space-y-6">
          
          {/* Search Mode Toggle Tabs */}
          <div className="flex rounded-2xl bg-dark-surface p-1.5 border border-dark-border max-w-md mx-auto shadow-md">
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
          <div className="bg-dark-surface border border-dark-border rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            
            {searchMode === 'route' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-3 items-center">
                  
                  {/* From Location Input */}
                  <div className="relative">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      {t.fromLocation}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                      <input
                        type="text"
                        value={fromInput}
                        onChange={(e) => setFromInput(e.target.value)}
                        placeholder="e.g. Vizianagaram"
                        className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-2xl text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Swap Locations Button */}
                  <div className="flex justify-center sm:pt-6">
                    <button
                      onClick={handleSwapLocations}
                      className="p-3 rounded-2xl bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-300 hover:text-white transition-all active:scale-95 shadow-sm"
                      title="Swap From and To"
                    >
                      <ArrowLeftRight className="w-4 h-4 rotate-90 sm:rotate-0" />
                    </button>
                  </div>

                  {/* To Location Input */}
                  <div className="relative">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      {t.toLocation}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                      <input
                        type="text"
                        value={toInput}
                        onChange={(e) => setToInput(e.target.value)}
                        placeholder="e.g. Parvathipuram"
                        className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-2xl text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                      />
                    </div>
                  </div>

                </div>

                <button
                  onClick={() => handleSearchRoute()}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>{t.searchBusRoute}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {t.enterBusNumber}
                  </label>
                  <div className="relative">
                    <Bus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                    <input
                      type="text"
                      value={busNumberInput}
                      onChange={(e) => setBusNumberInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchBusNumber()}
                      placeholder="e.g. AP 35 Z 4512 or 4512"
                      className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-2xl text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all uppercase"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSearchBusNumber()}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all active:scale-95"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>{t.trackBus}</span>
                </button>
              </div>
            )}

            {/* Popular Curated Routes Quick Chips */}
            <div className="pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.popularRoutes}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {busService.getPopularRoutes().map((route, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPopularRoute(route.from, route.to)}
                    className="px-3 py-1.5 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <span>{route.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-brand-500/20 text-brand-300 font-bold">
                      {route.count} {route.count === 1 ? 'bus' : 'buses'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 3. Available Buses List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Bus className="w-4 h-4 text-brand-400" />
                <span>{t.availableBuses} ({searchResults.length})</span>
              </h3>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {searchResults.map((bus) => (
                  <BusCard
                    key={bus.id}
                    bus={bus}
                    onTrackBus={handleTrackBus}
                  />
                ))}
              </div>
            ) : hasSearched ? (
              <div className="bg-dark-surface border border-dark-border rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-dark-card text-slate-500 mx-auto flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">{t.noBusesFound}</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try searching for popular routes like "Vizianagaram → Parvathipuram" or "Visakhapatnam → Vizianagaram".
                </p>
              </div>
            ) : null}
          </div>

        </div>
      )}

      {/* 4. ACTIVE BUS TRACKING VIEW (When a bus is actively selected) */}
      {activeBus && (
        <div className="space-y-6">
          
          {/* Top Status & Telemetry Metrics Card */}
          <div className="bg-dark-surface border border-dark-border rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-xl bg-brand-500/20 text-brand-300 font-extrabold text-sm border border-brand-500/30">
                    {activeBus.busNumber}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-dark-card text-slate-300 border border-dark-border">
                    {activeBus.busType}
                  </span>
                  {activeBus.status === 'on_time' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {t.onTime}
                    </span>
                  ) : activeBus.status === 'delayed' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      {t.delayed} (+{activeBus.delayMinutes} min)
                    </span>
                  ) : activeBus.status === 'arrived' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      {t.arrived}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/15 text-brand-400 border border-brand-500/30">
                      {t.approaching}
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

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              <div className="p-3 rounded-2xl bg-dark-bg/60 border border-dark-border/60">
                <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>{t.currentLocation}</span>
                </div>
                <div className="text-xs font-bold text-slate-200 truncate mt-1" title={activeBus.currentLocation.name}>
                  {activeBus.currentLocation.name}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-dark-bg/60 border border-dark-border/60">
                <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                  <CircleDot className="w-3 h-3 text-brand-400" />
                  <span>{t.nextStop}</span>
                </div>
                <div className="text-xs font-bold text-brand-400 truncate mt-1" title={activeBus.nextStop.name}>
                  {activeBus.nextStop.name}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-dark-bg/60 border border-dark-border/60">
                <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{t.estimatedArrival}</span>
                </div>
                <div className="text-xs font-bold text-emerald-400 mt-1">
                  {activeBus.expectedArrivalTime} ({activeBus.estimatedJourneyDuration})
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-dark-bg/60 border border-dark-border/60">
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
                {/* Manual Refresh Button */}
                <button
                  onClick={handleRefreshBusLocation}
                  disabled={isRefreshing || activeBus.status === 'arrived'}
                  className="flex items-center space-x-2 py-2.5 px-4 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-xs font-bold text-slate-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 text-brand-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{t.refreshBusLocation}</span>
                </button>

                {/* Auto-Simulation Toggle */}
                <button
                  onClick={() => setIsAutoSimulating(!isAutoSimulating)}
                  disabled={activeBus.status === 'arrived'}
                  className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border active:scale-95 disabled:opacity-50 ${
                    isAutoSimulating
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-dark-card hover:bg-dark-hover text-slate-300 border-dark-border'
                  }`}
                >
                  {isAutoSimulating ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Live Simulation (Active)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-slate-400" />
                      <span>Auto-Simulate</span>
                    </>
                  )}
                </button>
              </div>

              {/* Share Bus Status Button */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center space-x-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/25 transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.shareBusStatus}</span>
              </button>

            </div>

          </div>

          {/* Arrival Celebratory Banner (If bus reached destination or selected stop) */}
          {arrivalCelebrated && (
            <div className="bg-gradient-to-r from-purple-950/80 via-dark-surface to-brand-950/80 border-2 border-purple-500/50 rounded-3xl p-6 text-center space-y-3 shadow-2xl animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 mx-auto flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
                🎉
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                {t.busArrivedAtStop(activeBus.busNumber, selectedStop?.name || activeBus.destination.name)}
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Tracking session completed and saved to your Journey History.
              </p>
            </div>
          )}

          {/* 5. Live Interactive Bus Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-brand-400" />
                <span>{t.liveBusTracking}</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                {t.lastUpdated}: {activeBus.lastUpdated}
              </span>
            </div>

            <BusMap
              bus={activeBus}
              selectedStopId={selectedStopId}
            />
          </div>

          {/* 6. Ordered Bus Stop Sequence List */}
          <div className="bg-dark-surface border border-dark-border rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                  <span>{t.stopSequence} ({activeBus.stops.length} Stops)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tap "Set as My Stop" on any stop to receive 5-minute & 2-minute arrival alerts in {voiceLanguage}.
                </p>
              </div>
            </div>

            {/* Stops Timeline */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-dark-border">
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
                        <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/50 animate-pulse">
                          <CircleDot className="w-3.5 h-3.5" />
                        </div>
                      ) : isDest ? (
                        <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-dark-card text-slate-500 flex items-center justify-center border border-dark-border">
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        </div>
                      )}
                    </div>

                    {/* Stop Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className={`font-bold truncate ${
                          isPassed 
                            ? 'text-slate-400 line-through' 
                            : isMyStop 
                            ? 'text-amber-300 font-extrabold text-sm' 
                            : isNext 
                            ? 'text-brand-400 font-extrabold text-sm' 
                            : isDest 
                            ? 'text-red-400 font-extrabold text-sm' 
                            : 'text-slate-200'
                        }`}>
                          {stop.name}
                        </p>

                        {isMyStop && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            MY STOP
                          </span>
                        )}

                        {isNext && !isMyStop && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                            NEXT STOP
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                        <span>{stop.distanceFromStartKm} km from start</span>
                        {!isPassed && (
                          <span className="text-emerald-400 font-semibold">
                            ETA: ~{stop.etaMinutes} mins
                          </span>
                        )}
                      </div>
                    </div>

                    {/* "Set as My Stop" CTA */}
                    <div>
                      {isMyStop ? (
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          <Bell className="w-3.5 h-3.5" />
                          <span>Alert Armed</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectMyStop(stop)}
                          className="px-2.5 py-1.5 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-300 hover:text-amber-300 text-[11px] font-semibold transition-all active:scale-95"
                        >
                          {t.setMyStop}
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
