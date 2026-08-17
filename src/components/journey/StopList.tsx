import React from 'react';
import { StopInfo } from '../../types';
import { CheckCircle2, CircleDot, MapPin, Navigation } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface StopListProps {
  stops: StopInfo[];
  nextStop: StopInfo | null;
}

export const StopList: React.FC<StopListProps> = ({ stops, nextStop }) => {
  const { t } = useSettings();

  if (stops.length === 0) return null;

  return (
    <div className="bg-dark-surface border border-dark-border rounded-3xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-brand-400" />
          <span>Real Route Waypoints & Stops ({stops.length})</span>
        </h4>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-dark-border">
        {stops.map((stop, idx) => {
          const isNext = nextStop?.id === stop.id;
          const isDest = idx === stops.length - 1;
          const isPassed = stop.passed;

          return (
            <div key={stop.id} className="relative flex items-start space-x-3 text-xs">
              
              {/* Timeline Pin Indicator */}
              <div className="absolute -left-6 mt-0.5">
                {isPassed ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
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

              {/* Stop Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className={`font-semibold truncate ${
                    isPassed 
                      ? 'text-slate-400 line-through' 
                      : isNext 
                      ? 'text-brand-400 font-bold text-sm' 
                      : isDest 
                      ? 'text-red-400 font-bold text-sm' 
                      : 'text-slate-200'
                  }`}>
                    {stop.name}
                  </p>
                  {isNext && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      NEXT STOP
                    </span>
                  )}
                  {isDest && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                      DESTINATION
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mt-0.5">
                  {(stop.distanceFromStart / 1000).toFixed(1)} km from start
                </p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
