import React from 'react';
import { 
  Home, 
  MapPin, 
  Bus,
  Navigation, 
  History, 
  Bookmark, 
  ShieldCheck, 
  Settings as SettingsIcon 
} from 'lucide-react';
import { useJourney } from '../../context/JourneyContext';
import { useSettings } from '../../context/SettingsContext';

export type NavTab = 'dashboard' | 'plan' | 'bus' | 'live' | 'history' | 'favourites' | 'safety' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { t } = useSettings();
  const { activeJourney } = useJourney();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Home', icon: Home },
    { id: 'plan' as NavTab, label: t.planJourney, icon: MapPin },
    { id: 'bus' as NavTab, label: t.whereIsMyBus, icon: Bus },
    ...(activeJourney
      ? [{ id: 'live' as NavTab, label: 'Live GPS', icon: Navigation, isLive: true }]
      : []),
    { id: 'history' as NavTab, label: 'History', icon: History },
    { id: 'favourites' as NavTab, label: 'Saved', icon: Bookmark },
    { id: 'safety' as NavTab, label: 'Safety', icon: ShieldCheck },
    { id: 'settings' as NavTab, label: t.settings, icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile & Tablet Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-dark-surface/95 backdrop-blur-lg border-t border-dark-border px-1 py-1 md:hidden shadow-2xl"
      >
        <div className="flex items-center justify-around overflow-x-auto no-scrollbar gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isLive = item.isLive;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-1.5 min-w-[48px] rounded-xl transition-all ${
                  isActive
                    ? 'text-brand-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isLive ? (
                  <div className="relative flex items-center justify-center p-1.5 rounded-lg bg-brand-500/20 text-brand-400 -mt-2 shadow-lg shadow-brand-500/30 animate-pulse">
                    <Icon className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
                  </div>
                ) : (
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                )}
                <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
                  {item.label}
                </span>
                {isActive && !isLive && (
                  <span className="w-1 h-1 bg-brand-400 rounded-full mt-0.5"></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside 
        aria-label="Desktop Navigation"
        className="hidden md:flex flex-col w-64 fixed left-0 top-[61px] bottom-0 bg-dark-surface border-r border-dark-border p-4 z-30 space-y-2 overflow-y-auto"
      >
        <div className="text-xs font-semibold text-slate-500 px-3 uppercase tracking-wider mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isLive = item.isLive;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all text-sm font-medium ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                  : 'text-slate-300 hover:bg-dark-hover hover:text-white'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/15' : 'bg-dark-card'} ${isLive ? 'animate-pulse text-emerald-400' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left">{item.label}</span>
              {isLive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE
                </span>
              )}
            </button>
          );
        })}
      </aside>
    </>
  );
};
