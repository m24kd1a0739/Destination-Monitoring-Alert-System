import React from 'react';
import { Bus, MapPin, Clock, ArrowRight, Radio, Navigation, Gauge } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { BusInfo } from '../../types';

interface BusCardProps {
  bus: BusInfo;
  onTrackBus: (bus: BusInfo) => void;
}

export const BusCard: React.FC<BusCardProps> = ({ bus, onTrackBus }) => {
  const { t } = useSettings();

  const getStatusBadge = () => {
    switch (bus.status) {
      case 'on_time':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            {t.onTime}
          </span>
        );
      case 'delayed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
            {t.delayed} (+{bus.delayMinutes}m)
          </span>
        );
      case 'approaching':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mr-1.5"></span>
            {t.approaching}
          </span>
        );
      case 'arrived':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5"></span>
            {t.arrived}
          </span>
        );
      default:
        return null;
    }
  };

  const getBusTypeColor = (type: string) => {
    switch (type) {
      case 'Garuda Plus':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Super Luxury':
        return 'bg-brand-500/15 text-brand-300 border-brand-500/30';
      case 'Ultra Deluxe':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'Express':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-3xl p-5 shadow-xl hover:border-brand-500/40 transition-all hover:shadow-2xl hover:shadow-brand-500/5 group flex flex-col justify-between space-y-4">
      
      {/* Top Bar: Bus Registration, Bus Type Badge & Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white tracking-wide">
                {bus.busNumber}
              </h3>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getBusTypeColor(bus.busType)}`}>
                {bus.busType}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {bus.busName} • {bus.routeName}
            </p>
          </div>
        </div>

        <div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Route & Progress Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-dark-bg/60 border border-dark-border/60 text-xs">
        
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">
            {t.currentLocation}
          </span>
          <span className="font-semibold text-slate-200 truncate block mt-0.5" title={bus.currentLocation.name}>
            {bus.currentLocation.name}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">
            {t.nextStop}
          </span>
          <span className="font-semibold text-brand-400 truncate block mt-0.5" title={bus.nextStop.name}>
            {bus.nextStop.name}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">
            {t.estimatedArrival}
          </span>
          <span className="font-semibold text-emerald-400 block mt-0.5">
            {bus.expectedArrivalTime} ({bus.estimatedJourneyDuration})
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">
            {t.distanceRemaining}
          </span>
          <span className="font-semibold text-slate-200 block mt-0.5">
            {bus.distanceRemainingKm} km ({bus.speedKmH} km/h)
          </span>
        </div>

      </div>

      {/* Bottom Actions: Stops summary and Track Bus CTA */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-1 text-xs text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>{bus.stops.length} Stops ({bus.source.name} → {bus.destination.name})</span>
        </div>

        <button
          onClick={() => onTrackBus(bus)}
          className="flex items-center space-x-2 py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/25 transition-all active:scale-95 group-hover:shadow-brand-600/40"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>{t.trackBus}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
};
