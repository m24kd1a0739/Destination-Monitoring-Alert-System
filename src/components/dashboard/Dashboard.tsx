import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Share2, 
  History, 
  Bookmark, 
  ShieldAlert, 
  Settings as SettingsIcon, 
  ArrowRight, 
  Radio, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Compass, 
  Moon, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJourney } from '../../context/JourneyContext';
import { useSettings } from '../../context/SettingsContext';
import { NavTab } from '../layout/BottomNav';
import { geolocationService, GeolocationPermissionState } from '../../services/geolocation';
import { reverseGeocode } from '../../services/geocoding';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
  onOpenShare: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenShare }) => {
  const { user } = useAuth();
  const { t, alertSettings, updateAlertSettings } = useSettings();
  const { 
    activeJourney, 
    currentGPS, 
    gpsError, 
    refreshGPS, 
    journeyHistory, 
    favouriteRoutes,
    openSOSModal 
  } = useJourney();

  const [permissionState, setPermissionState] = useState<GeolocationPermissionState>('prompt');
  const [currentAddress, setCurrentAddress] = useState<string>('Detecting location...');
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetingMorning;
    if (hour < 17) return t.greetingAfternoon;
    return t.greetingEvening;
  };

  useEffect(() => {
    geolocationService.checkPermission().then((status) => {
      setPermissionState(status);
    });
  }, []);

  useEffect(() => {
    if (currentGPS) {
      setPermissionState('granted');
      reverseGeocode(currentGPS.lat, currentGPS.lng).then((res) => {
        setCurrentAddress(res.name || res.displayName);
      });
    }
  }, [currentGPS]);

  const handleRequestLocation = async () => {
    setIsRequestingLocation(true);
    const coords = await refreshGPS();
    setIsRequestingLocation(false);
    if (coords) {
      setPermissionState('granted');
    } else {
      setPermissionState('denied');
    }
  };

  const getStatusBadge = () => {
    if (!activeJourney) {
      return {
        text: t.readyStatus,
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
        dot: 'bg-blue-400'
      };
    }
    if (activeJourney.status === 'monitoring') {
      return {
        text: t.monitoringStatus,
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
        dot: 'bg-emerald-400 animate-ping'
      };
    }
    if (activeJourney.status === 'paused') {
      return {
        text: t.pausedStatus,
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
        dot: 'bg-amber-400'
      };
    }
    if (activeJourney.status === 'reached') {
      return {
        text: t.reachedStatus,
        color: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
        dot: 'bg-purple-400'
      };
    }
    return {
      text: t.readyStatus,
      color: 'bg-slate-500/10 text-slate-400 border-slate-500/25',
      dot: 'bg-slate-400'
    };
  };

  const badge = getStatusBadge();

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Greeting & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-br from-dark-surface via-dark-surface to-dark-card border border-dark-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
              Passenger Portal
            </span>
            <span className="text-slate-600">•</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${badge.dot}`}></span>
              {badge.text}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {getGreeting()}, <span className="text-brand-400">{user?.name || 'Passenger'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            {activeJourney 
              ? `Currently monitoring transit to ${activeJourney.destination.name}.`
              : t.tagline}
          </p>
        </div>

        {/* Nap Mode Toggle Quick Action */}
        <div className="relative z-10 flex items-center space-x-2 self-start sm:self-center">
          <button
            onClick={() => updateAlertSettings({ napMode: !alertSettings.napMode })}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl border transition-all text-xs font-semibold ${
              alertSettings.napMode
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-lg shadow-indigo-500/20'
                : 'bg-dark-card hover:bg-dark-hover text-slate-400 border-dark-border'
            }`}
          >
            <Moon className={`w-4 h-4 ${alertSettings.napMode ? 'text-indigo-400 fill-indigo-400' : ''}`} />
            <span>{t.napMode}: {alertSettings.napMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Decorative background aura */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Location Permission Section (Real Geolocation Status) */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        permissionState === 'granted'
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : permissionState === 'denied'
          ? 'bg-red-950/20 border-red-500/30'
          : 'bg-dark-surface border-dark-border'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className={`p-2.5 rounded-xl ${
              permissionState === 'granted'
                ? 'bg-emerald-500/20 text-emerald-400'
                : permissionState === 'denied'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-brand-500/20 text-brand-400'
            }`}>
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold text-white">
                  {permissionState === 'granted' ? t.locationAccessEnabled : t.locationPermissionTitle}
                </h4>
                {currentGPS && (
                  <span className="text-[10px] text-slate-400 bg-dark-card px-2 py-0.5 rounded-md border border-dark-border">
                    Acc: ±{Math.round(currentGPS.accuracy || 10)}m
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {permissionState === 'granted' && currentGPS
                  ? currentAddress
                  : permissionState === 'denied'
                  ? t.locationPermissionRequired
                  : t.locationPermissionDesc}
              </p>
            </div>
          </div>

          <div>
            {permissionState !== 'granted' ? (
              <button
                onClick={handleRequestLocation}
                disabled={isRequestingLocation}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Compass className={`w-3.5 h-3.5 ${isRequestingLocation ? 'animate-spin' : ''}`} />
                <span>{isRequestingLocation ? 'Requesting GPS...' : t.allowLocationBtn}</span>
              </button>
            ) : (
              <button
                onClick={handleRequestLocation}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-dark-hover transition-colors flex items-center space-x-1"
              >
                <span>{t.retryPermission}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Journey Hero Card (Displayed Only When Journey Exists) */}
      {activeJourney && (
        <div className="bg-gradient-to-br from-brand-950/40 via-dark-card to-dark-surface border border-brand-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h3 className="text-sm font-bold tracking-tight text-white">
                {t.currentJourneyCardTitle}
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase">
              {activeJourney.mode}
            </span>
          </div>

          {/* Route Source & Destination */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center space-x-3 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <span className="text-slate-400 text-[10px] block uppercase font-medium">Source</span>
                <p className="text-white font-medium truncate">{activeJourney.source.name}</p>
              </div>
            </div>
            <div className="border-l-2 border-dashed border-dark-border ml-1 pl-4 py-0.5"></div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <span className="text-slate-400 text-[10px] block uppercase font-medium">Destination</span>
                <p className="text-white font-bold text-sm truncate">{activeJourney.destination.name}</p>
              </div>
            </div>
          </div>

          {/* Dynamic Metrics */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-dark-bg/60 border border-dark-border mb-5 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block uppercase">{t.distanceRemaining}</span>
              <p className="text-sm sm:text-base font-bold text-white mt-0.5">
                {(activeJourney.remainingDistance / 1000).toFixed(1)} km
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium block uppercase">{t.timeRemaining}</span>
              <p className="text-sm sm:text-base font-bold text-brand-400 mt-0.5">
                {Math.ceil(activeJourney.remainingDuration / 60)} min
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium block uppercase">{t.eta}</span>
              <p className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">
                {activeJourney.eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-5">
            <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1.5">
              <span>{t.journeyProgress}</span>
              <span className="text-brand-400 font-bold">{activeJourney.progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-dark-surface rounded-full overflow-hidden border border-dark-border">
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${activeJourney.progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('live')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>View Live Navigation</span>
            </button>
            <button
              onClick={onOpenShare}
              className="py-2.5 px-4 rounded-xl bg-dark-surface hover:bg-dark-hover text-slate-200 border border-dark-border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.shareJourney}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Plan Journey */}
        <button
          onClick={() => onNavigate('plan')}
          className="flex flex-col items-start p-4 sm:p-5 rounded-2xl bg-dark-surface hover:bg-dark-card border border-dark-border hover:border-brand-500/40 transition-all text-left group active:scale-[0.98] shadow-md"
        >
          <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-brand-400 transition-colors">
            {t.planJourney}
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Search stops, compare routes & ETAs.
          </p>
        </button>

        {/* Live Tracking */}
        <button
          onClick={() => onNavigate(activeJourney ? 'live' : 'plan')}
          className="flex flex-col items-start p-4 sm:p-5 rounded-2xl bg-dark-surface hover:bg-dark-card border border-dark-border hover:border-emerald-500/40 transition-all text-left group active:scale-[0.98] shadow-md"
        >
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all mb-3">
            <Navigation className="w-6 h-6" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
            {activeJourney ? 'Live Navigation' : t.startMonitoring}
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {activeJourney ? 'Track GPS and upcoming stops' : 'Select a route to begin monitoring.'}
          </p>
        </button>

        {/* Share Live Journey */}
        <button
          onClick={() => {
            if (activeJourney) onOpenShare();
            else onNavigate('plan');
          }}
          className="flex flex-col items-start p-4 sm:p-5 rounded-2xl bg-dark-surface hover:bg-dark-card border border-dark-border hover:border-purple-500/40 transition-all text-left group active:scale-[0.98] shadow-md"
        >
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all mb-3">
            <Share2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-400 transition-colors">
            {t.shareJourney}
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Send WhatsApp live tracking to family.
          </p>
        </button>

        {/* Safety & SOS */}
        <button
          onClick={openSOSModal}
          className="flex flex-col items-start p-4 sm:p-5 rounded-2xl bg-red-950/15 hover:bg-red-950/30 border border-red-500/30 hover:border-red-500/50 transition-all text-left group active:scale-[0.98] shadow-md"
        >
          <div className="p-3 rounded-2xl bg-red-500/20 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-red-400 transition-colors">
            {t.safetySOS}
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Emergency contact circle & 1-tap dial.
          </p>
        </button>

        {/* Favourite Routes */}
        <button
          onClick={() => onNavigate('favourites')}
          className="flex flex-col items-start p-4 sm:p-5 rounded-2xl bg-dark-surface hover:bg-dark-card border border-dark-border hover:border-amber-500/40 transition-all text-left group active:scale-[0.98] shadow-md"
        >
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors">
            {t.favouriteRoutes}
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {favouriteRoutes.length} saved frequent routes.
          </p>
        </button>

        {/* Journey History */}
        <button
          onClick={() => onNavigate('history')}
          className="flex flex-col items-start p-4 sm:p-5 rounded-2xl bg-dark-surface hover:bg-dark-card border border-dark-border hover:border-teal-500/40 transition-all text-left group active:scale-[0.98] shadow-md"
        >
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all mb-3">
            <History className="w-6 h-6" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-teal-400 transition-colors">
            {t.journeyHistory}
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {journeyHistory.length} recorded completed trips.
          </p>
        </button>

        {/* Settings & Voice */}
        <button
          onClick={() => onNavigate('settings')}
          className="flex flex-col items-start p-4 sm:p-5 rounded-2xl bg-dark-surface hover:bg-dark-card border border-dark-border hover:border-slate-500/40 transition-all text-left group active:scale-[0.98] shadow-md sm:col-span-2"
        >
          <div className="p-3 rounded-2xl bg-slate-500/10 text-slate-300 group-hover:bg-slate-700 group-hover:text-white transition-all mb-3">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-brand-400 transition-colors">
            {t.settings} & Multilingual Voice
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            English, Telugu, Hindi, Tamil, Kannada voice synthesis & alert timings.
          </p>
        </button>

      </div>

    </div>
  );
};
