import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Share2, 
  StopCircle, 
  Pause, 
  Play, 
  RefreshCw, 
  AlertTriangle, 
  ShieldAlert, 
  Radio, 
  Volume2, 
  Compass, 
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJourney } from '../../context/JourneyContext';
import { useSettings } from '../../context/SettingsContext';
import { LiveMap } from './LiveMap';
import { StopList } from './StopList';

interface LiveJourneyProps {
  onOpenShare: () => void;
  onOpenDelayShare: () => void;
}

export const LiveJourney: React.FC<LiveJourneyProps> = ({ onOpenShare, onOpenDelayShare }) => {
  const { user } = useAuth();
  const { t, alertSettings, voiceLanguage } = useSettings();
  const { 
    activeJourney, 
    currentGPS, 
    stopJourney, 
    pauseJourney, 
    resumeJourney, 
    recalculateActiveRoute, 
    openSOSModal 
  } = useJourney();

  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  if (!activeJourney) {
    return (
      <div className="text-center py-16 px-4 bg-dark-surface border border-dark-border rounded-3xl p-8 max-w-md mx-auto">
        <Navigation className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-bold text-white mb-1">No Active Journey</h3>
        <p className="text-xs text-slate-400 mb-6">{t.noActiveJourney}</p>
      </div>
    );
  }

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    await recalculateActiveRoute();
    setIsRecalculating(false);
  };

  const remainingMins = Math.ceil(activeJourney.remainingDuration / 60);
  const remainingKm = (activeJourney.remainingDistance / 1000).toFixed(1);
  const isPaused = activeJourney.status === 'paused';

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Journey Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-dark-surface border border-dark-border rounded-3xl p-5 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="relative p-3 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/25 flex-shrink-0">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                {activeJourney.mode.toUpperCase()} Transit
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5"></span>
                {t.monitoringStatus}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-sm mt-0.5">
              To: {activeJourney.destination.name}
            </h2>
          </div>
        </div>

        {/* Quick Share / SOS Buttons */}
        <div className="flex items-center space-x-2 self-end sm:self-center">
          <button
            onClick={onOpenShare}
            className="flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-dark-card hover:bg-dark-hover text-slate-200 border border-dark-border text-xs font-semibold transition-colors shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>{t.shareJourney}</span>
          </button>
          <button
            onClick={openSOSModal}
            className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors"
            title={t.safetySOS}
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Off-Route Alert Banner */}
      {activeJourney.isOffRoute && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/10 animate-pulse">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Off-Route Detected</h4>
              <p className="text-xs text-amber-200/90 mt-0.5">{t.offRouteWarning}</p>
            </div>
          </div>
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isRecalculating ? 'Recalculating...' : t.recalculateRouteBtn}
          </button>
        </div>
      )}

      {/* Delay Alert Banner */}
      {activeJourney.isDelayed && (
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">{t.journeyDelayedMsg}</h4>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Delay: ~{activeJourney.delayMinutes} mins • {t.updatedEta}: {activeJourney.eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenDelayShare}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            {t.shareDelayBtn}
          </button>
        </div>
      )}

      {/* Main Dynamic Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Remaining Time */}
        <div className="p-4 sm:p-5 rounded-3xl bg-dark-surface border border-dark-border shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1">
            {t.timeRemaining}
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-brand-400">{remainingMins}</span>
            <span className="text-xs text-slate-400 font-medium">{t.minutes}</span>
          </div>
        </div>

        {/* Remaining Distance */}
        <div className="p-4 sm:p-5 rounded-3xl bg-dark-surface border border-dark-border shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1">
            {t.distanceRemaining}
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{remainingKm}</span>
            <span className="text-xs text-slate-400 font-medium">{t.kilometers}</span>
          </div>
        </div>

        {/* Dynamic Estimated Arrival */}
        <div className="p-4 sm:p-5 rounded-3xl bg-dark-surface border border-dark-border shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1">
            {t.eta}
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">
              {activeJourney.eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Progress Percent */}
        <div className="p-4 sm:p-5 rounded-3xl bg-dark-surface border border-dark-border shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1">
            {t.journeyProgress}
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400">
              {activeJourney.progressPercent}%
            </span>
          </div>
        </div>

      </div>

      {/* Progress Bar */}
      <div className="bg-dark-surface border border-dark-border rounded-3xl p-5 shadow-lg">
        <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
          <div className="flex items-center space-x-1.5 truncate max-w-[45%]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="truncate">{activeJourney.source.name}</span>
          </div>
          <div className="flex items-center space-x-1.5 truncate max-w-[45%]">
            <span className="truncate text-red-400">{activeJourney.destination.name}</span>
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
          </div>
        </div>
        <div className="w-full h-3 bg-dark-bg rounded-full overflow-hidden border border-dark-border">
          <div 
            className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${activeJourney.progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Live Map */}
      <LiveMap
        currentGPS={currentGPS}
        source={activeJourney.source}
        destination={activeJourney.destination}
        selectedRoute={activeJourney.selectedRoute}
        stops={activeJourney.stops}
        nextStop={activeJourney.nextStop}
        className="h-[340px] sm:h-[420px]"
      />

      {/* Next Stop Alert Card */}
      {activeJourney.nextStop && (
        <div className="p-4 sm:p-5 rounded-3xl bg-brand-950/20 border border-brand-500/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/20 text-brand-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-brand-300 tracking-wider block">
                {t.nextStop}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white">
                {activeJourney.nextStop.name}
              </h4>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-dark-card px-2.5 py-1 rounded-xl border border-dark-border">
            {(activeJourney.nextStop.distanceFromStart / 1000).toFixed(1)} km
          </span>
        </div>
      )}

      {/* Real Route Named Stops List */}
      <StopList
        stops={activeJourney.stops}
        nextStop={activeJourney.nextStop}
      />

      {/* Control Actions (Pause / Stop / Recalculate) */}
      <div className="bg-dark-surface border border-dark-border rounded-3xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        
        {/* Recalculate Route */}
        <button
          onClick={handleRecalculate}
          disabled={isRecalculating}
          className="py-2.5 px-4 rounded-xl bg-dark-card hover:bg-dark-hover text-slate-300 border border-dark-border text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
          <span>{isRecalculating ? 'Recalculating...' : t.recalculateRouteBtn}</span>
        </button>

        {/* Pause/Resume & Stop Journey */}
        <div className="flex items-center space-x-2">
          <button
            onClick={isPaused ? resumeJourney : pauseJourney}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-1.5 ${
              isPaused 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-md' 
                : 'bg-dark-card hover:bg-dark-hover text-amber-300 border-amber-500/30'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? t.resumeJourney : t.pauseJourney}</span>
          </button>

          <button
            onClick={() => setShowStopConfirm(true)}
            className="py-2.5 px-4 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md active:scale-95"
          >
            <StopCircle className="w-3.5 h-3.5" />
            <span>{t.stopJourney}</span>
          </button>
        </div>

      </div>

      {/* Stop Journey Confirmation Dialog */}
      {showStopConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-dark-surface border border-dark-border rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
              <StopCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">{t.stopJourney}?</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {t.stopJourneyConfirm}
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStopConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-dark-card text-xs text-slate-300 border border-dark-border font-medium"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  stopJourney(false);
                  setShowStopConfirm(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-xs text-white font-bold shadow-lg shadow-red-600/30"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
