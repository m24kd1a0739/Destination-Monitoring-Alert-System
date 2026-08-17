import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useJourney } from '../../context/JourneyContext';
import { useSettings } from '../../context/SettingsContext';
import { 
  Navigation, 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  User as UserIcon, 
  Bell, 
  Compass, 
  Radio
} from 'lucide-react';

interface HeaderProps {
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenProfile }) => {
  const { user } = useAuth();
  const { t } = useSettings();
  const { activeJourney, isTracking, openSOSModal } = useJourney();
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-dark-surface/90 backdrop-blur-md border-b border-dark-border px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Project Identity */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/20">
            <Navigation className="w-5 h-5 -rotate-45" />
            {isTracking && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-dark-surface"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                DESTINATION MONITOR
              </h1>
              {activeJourney && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                  <Radio className="w-3 h-3 mr-1" />
                  {t.monitoringStatus}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden xs:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Status Indicators & Action Tools */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Online/Offline Badge */}
          <div 
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isOnline 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
            title={isOnline ? t.online : t.offline}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isOnline ? t.online : t.offline}</span>
          </div>

          {/* SOS Quick Trigger */}
          <button
            onClick={openSOSModal}
            aria-label="Emergency SOS"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 transition-all font-semibold text-xs active:scale-95 shadow-sm"
          >
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="tracking-wide">SOS</span>
          </button>

          {/* User Profile Button */}
          {user && (
            <button
              onClick={onOpenProfile}
              aria-label="View User Profile"
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-dark-card hover:bg-dark-hover text-slate-200 border border-dark-border transition-all active:scale-95"
            >
              <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium max-w-[100px] truncate hidden md:inline">
                {user.name}
              </span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
