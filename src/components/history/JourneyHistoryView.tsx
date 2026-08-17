import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { useJourney } from '../../context/JourneyContext';
import { useSettings } from '../../context/SettingsContext';

export const JourneyHistoryView: React.FC = () => {
  const { journeyHistory, clearHistory, showToast } = useJourney();
  const { t } = useSettings();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClear = () => {
    clearHistory();
    setShowClearConfirm(false);
    showToast(t.appName, 'History cleared', 'info');
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="w-6 h-6 text-teal-400" />
            <span>{t.journeyHistory}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log of all completed and monitored transit trips stored locally on device.
          </p>
        </div>

        {journeyHistory.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-xs text-red-400 hover:text-red-300 py-1.5 px-3 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border flex items-center space-x-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearHistory}</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {journeyHistory.length === 0 ? (
        <div className="p-12 rounded-3xl bg-dark-surface border border-dark-border text-center max-w-md mx-auto">
          <History className="w-14 h-14 text-slate-500 mx-auto mb-3 opacity-40" />
          <h4 className="text-base font-bold text-white mb-1">{t.noJourneysYet}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            When you complete or cancel a live journey, the timestamp, distance, and duration will be saved here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {journeyHistory.map((item) => {
            const isCompleted = item.status === 'Completed';

            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-dark-surface border border-dark-border hover:border-slate-700 transition-all shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-dark-card border border-dark-border text-brand-300 uppercase">
                    {item.mode}
                  </span>
                </div>

                {/* Route */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
                    <span className="text-slate-300 truncate">{item.sourceName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></span>
                    <span className="text-white font-bold truncate">{item.destinationName}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-dark-border text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Date</span>
                    <span className="font-semibold text-slate-200">{item.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
                    <span className="font-semibold text-brand-400">{item.durationFormatted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Distance</span>
                    <span className="font-semibold text-emerald-400">{item.distanceFormatted}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-dark-surface border border-dark-border rounded-3xl p-6 shadow-2xl text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-2">{t.clearHistory}?</h3>
            <p className="text-xs text-slate-400 mb-5">{t.clearHistoryConfirm}</p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-dark-card text-xs text-slate-300 border border-dark-border"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs text-white font-bold"
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
