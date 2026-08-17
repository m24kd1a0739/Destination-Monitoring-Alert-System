import React from 'react';
import { Footprints, Bike, Car, Bus, Train, Info } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { TravelMode } from '../../types';

interface TravelModePickerProps {
  selectedMode: TravelMode;
  onChangeMode: (mode: TravelMode) => void;
  transitNotice?: string;
}

export const TravelModePicker: React.FC<TravelModePickerProps> = ({
  selectedMode,
  onChangeMode,
  transitNotice
}) => {
  const { t } = useSettings();

  const modes: { id: TravelMode; label: string; icon: React.FC<{ className?: string }>; color: string }[] = [
    { id: 'bus', label: t.modeBus, icon: Bus, color: 'from-blue-600 to-cyan-500' },
    { id: 'car', label: t.modeCar, icon: Car, color: 'from-amber-600 to-orange-500' },
    { id: 'bike', label: t.modeBike, icon: Bike, color: 'from-emerald-600 to-teal-500' },
    { id: 'walk', label: t.modeWalk, icon: Footprints, color: 'from-purple-600 to-indigo-500' },
    { id: 'train', label: t.modeTrain, icon: Train, color: 'from-rose-600 to-pink-500' },
  ];

  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
        {t.travelMode}
      </label>
      
      {/* Mode Buttons */}
      <div className="grid grid-cols-5 gap-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = selectedMode === m.id;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChangeMode(m.id)}
              className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all text-xs font-bold active:scale-95 ${
                isSelected
                  ? `bg-gradient-to-b ${m.color} text-white border-transparent shadow-lg shadow-brand-500/25 scale-[1.03]`
                  : 'bg-dark-card text-slate-400 hover:text-slate-200 border-dark-border hover:border-dark-hover'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] sm:text-xs tracking-tight">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Transit Provider Notice Banner */}
      {transitNotice && (
        <div className="p-3 rounded-xl bg-dark-card border border-dark-border flex items-start space-x-2 text-[11px] text-slate-400">
          <Info className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">{transitNotice}</p>
        </div>
      )}
    </div>
  );
};
