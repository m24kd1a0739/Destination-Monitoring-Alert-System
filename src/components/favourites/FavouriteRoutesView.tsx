import React from 'react';
import { 
  Bookmark, 
  Trash2, 
  Navigation, 
  MapPin, 
  ArrowRight, 
  Clock 
} from 'lucide-react';
import { useJourney } from '../../context/JourneyContext';
import { useSettings } from '../../context/SettingsContext';
import { FavouriteRoute } from '../../types';

interface FavouriteRoutesViewProps {
  onStartRoute: (route: FavouriteRoute) => void;
  onNavigateToPlan: () => void;
}

export const FavouriteRoutesView: React.FC<FavouriteRoutesViewProps> = ({
  onStartRoute,
  onNavigateToPlan
}) => {
  const { favouriteRoutes, deleteFavourite, showToast } = useJourney();
  const { t } = useSettings();

  const handleDelete = (id: string) => {
    deleteFavourite(id);
    showToast(t.appName, 'Removed from favourites', 'info');
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-400" />
            <span>{t.favouriteRoutes}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quick-start frequent daily commutes with pre-configured stops.
          </p>
        </div>
      </div>

      {/* Empty State */}
      {favouriteRoutes.length === 0 ? (
        <div className="p-12 rounded-3xl bg-dark-surface border border-dark-border text-center max-w-md mx-auto">
          <Bookmark className="w-14 h-14 text-slate-500 mx-auto mb-3 opacity-40" />
          <h4 className="text-base font-bold text-white mb-1">{t.noFavouritesYet}</h4>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Save your frequent daily bus commutes from the Route Planning screen for instant 1-tap navigation.
          </p>
          <button
            onClick={onNavigateToPlan}
            className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
          >
            Plan & Save New Route
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {favouriteRoutes.map((fav) => (
            <div
              key={fav.id}
              className="p-5 rounded-3xl bg-dark-surface border border-dark-border hover:border-amber-500/30 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {fav.mode}
                  </span>
                  <button
                    onClick={() => handleDelete(fav.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-dark-hover transition-colors"
                    title={t.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-base font-bold text-white mb-3 truncate">{fav.title}</h4>

                {/* Source & Destination */}
                <div className="space-y-1.5 text-xs text-slate-300 mb-5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
                    <span className="truncate">{fav.source.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></span>
                    <span className="truncate font-semibold text-white">{fav.destination.name}</span>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={() => onStartRoute(fav)}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open & Calculate Route</span>
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
