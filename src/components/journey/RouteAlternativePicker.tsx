import React from 'react';
import { RouteOption } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { Zap, CornerDownRight, Navigation, Check } from 'lucide-react';

interface RouteAlternativePickerProps {
  routes: RouteOption[];
  selectedRouteId: string;
  onSelectRoute: (route: RouteOption) => void;
}

export const RouteAlternativePicker: React.FC<RouteAlternativePickerProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute
}) => {
  const { t } = useSettings();

  if (routes.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Available Route Options ({routes.length})
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {routes.map((route, idx) => {
          const isSelected = route.id === selectedRouteId;
          const mins = Math.ceil(route.duration / 60);
          const km = (route.distance / 1000).toFixed(1);
          const eta = new Date(Date.now() + route.duration * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });

          const title = idx === 0 ? t.fastest : idx === 1 ? t.shortest : t.alternative;

          return (
            <button
              key={route.id}
              type="button"
              onClick={() => onSelectRoute(route)}
              className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all relative active:scale-[0.98] ${
                isSelected
                  ? 'bg-gradient-to-br from-brand-950/60 to-dark-card border-brand-500 shadow-lg shadow-brand-500/20 ring-1 ring-brand-500'
                  : 'bg-dark-card border-dark-border hover:border-slate-600 text-slate-400'
              }`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
              )}

              <div className="flex items-center space-x-1.5 mb-1.5">
                <Zap className={`w-3.5 h-3.5 ${idx === 0 ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-white">{title}</span>
              </div>

              <div className="flex items-baseline space-x-1.5">
                <span className="text-lg font-extrabold text-brand-400">{mins}</span>
                <span className="text-xs font-medium text-slate-400">mins</span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs font-semibold text-slate-300">{km} km</span>
              </div>

              <div className="text-[11px] text-emerald-400 font-medium mt-1">
                Arrival: {eta}
              </div>

              <p className="text-[10px] text-slate-400 mt-2 truncate max-w-[200px]">
                {route.summary}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
