import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Share2, Send, X, Sparkles, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJourney } from '../../context/JourneyContext';
import { useSettings } from '../../context/SettingsContext';
import { shareEngine } from '../../services/shareEngine';

interface DestinationReachedModalProps {
  onClose: () => void;
}

export const DestinationReachedModal: React.FC<DestinationReachedModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useSettings();
  const { activeJourney, stopJourney } = useJourney();

  useEffect(() => {
    // Fire celebratory confetti explosion
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn('Confetti note:', e);
    }
  }, []);

  if (!activeJourney || !user) return null;

  const shareText = shareEngine.getArrivalText(activeJourney, user, language);

  const handleWhatsAppArrival = () => {
    shareEngine.shareViaWhatsApp(shareText);
  };

  const handleClose = () => {
    stopJourney(true);
    onClose();
  };

  const arrivalTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/90 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-dark-surface via-dark-surface to-dark-card border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center">
        
        {/* Celebration Icon */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/30 mb-4 animate-bounce">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        {/* Title & Greeting */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-1 tracking-tight">
          {t.destinationReached}
        </h3>
        <p className="text-xs sm:text-sm text-emerald-400 font-semibold mb-4">
          {t.destinationReachedMsg}
        </p>

        {/* Journey Summary Badge */}
        <div className="p-4 rounded-2xl bg-dark-bg/80 border border-dark-border mb-5 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Passenger:</span>
            <span className="text-white font-bold">{user.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Destination:</span>
            <span className="text-emerald-400 font-bold truncate max-w-[200px]">{activeJourney.destination.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Arrival Time:</span>
            <span className="text-white font-bold">{arrivalTime}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Distance Traveled:</span>
            <span className="text-slate-200 font-semibold">{(activeJourney.selectedRoute.distance / 1000).toFixed(1)} km</span>
          </div>
        </div>

        {/* Language Selection for Arrival Message */}
        <div className="mb-4 text-left">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Arrival Message Language:
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(['en', 'te', 'hi', 'ta', 'kn'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={`py-1 rounded-lg text-xs font-bold transition-all border ${
                  language === l
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-dark-card text-slate-400 hover:text-slate-200 border-dark-border'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* One-Tap WhatsApp Share Button */}
        <div className="space-y-2.5">
          <button
            onClick={handleWhatsAppArrival}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-sm shadow-xl shadow-[#25D366]/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            <span>{t.shareArrivalBtn}</span>
          </button>

          <button
            onClick={handleClose}
            className="w-full py-2.5 px-4 rounded-xl bg-dark-card hover:bg-dark-hover text-slate-300 border border-dark-border text-xs font-semibold transition-colors"
          >
            Complete & Finish Journey
          </button>
        </div>

      </div>
    </div>
  );
};
