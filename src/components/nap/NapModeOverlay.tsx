import React from 'react';
import { BellRing, Moon, Volume2, AlertOctagon, Check } from 'lucide-react';
import { useJourney } from '../../context/JourneyContext';
import { useSettings } from '../../context/SettingsContext';

export const NapModeOverlay: React.FC = () => {
  const { isNapAlertActive, dismissNapAlert, activeJourney } = useJourney();
  const { t } = useSettings();

  if (!isNapAlertActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/95 backdrop-blur-2xl animate-pulse">
      <div className="w-full max-w-lg bg-gradient-to-b from-red-900 via-dark-surface to-dark-bg border-4 border-red-500 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
        
        {/* Pulsing Alarm Beacon */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-red-600 text-white shadow-2xl shadow-red-500/50 animate-bounce mx-auto">
          <BellRing className="w-14 h-14 animate-wiggle" />
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        </div>

        {/* Big Alert Texts */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-tight">
            {t.napModeWakeUp}
          </h2>
          {activeJourney && (
            <p className="text-lg font-bold text-amber-300">
              Destination: {activeJourney.destination.name}
            </p>
          )}
          <p className="text-xs sm:text-sm text-red-200">
            {activeJourney?.status === 'reached'
              ? 'You have arrived at your destination! Please exit the bus safely.'
              : 'Your bus stop is approximately 2 to 5 minutes away. Move towards the exit now!'}
          </p>
        </div>

        {/* Big Touch Target Dismiss Button */}
        <button
          onClick={dismissNapAlert}
          className="w-full py-5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-base sm:text-lg shadow-2xl shadow-white/30 flex items-center justify-center space-x-3 transition-all transform active:scale-95"
        >
          <Check className="w-6 h-6 text-emerald-600 stroke-[3]" />
          <span>{t.dismissNapAlert}</span>
        </button>

      </div>
    </div>
  );
};
