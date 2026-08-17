import React, { useState } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  Send, 
  X, 
  AlertTriangle, 
  MapPin, 
  Copy, 
  Check, 
  Compass 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJourney } from '../../context/JourneyContext';
import { useSettings } from '../../context/SettingsContext';
import { shareEngine } from '../../services/shareEngine';

export const SOSModal: React.FC = () => {
  const { user } = useAuth();
  const { emergencyContacts, language, t } = useSettings();
  const { currentGPS, isSOSModalOpen, closeSOSModal, showToast } = useJourney();

  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isSOSModalOpen) return null;

  const priority1Contact = emergencyContacts.find((c) => c.priority === 1) || emergencyContacts[0];
  const lat = currentGPS?.lat || 0;
  const lng = currentGPS?.lng || 0;

  const emergencyMessage = user
    ? shareEngine.getEmergencyText(user, lat, lng, language)
    : `🚨 EMERGENCY SOS ALERT! Live Location: https://www.google.com/maps?q=${lat},${lng}`;

  const handleWhatsAppDispatch = () => {
    shareEngine.shareViaWhatsApp(emergencyMessage);
  };

  const handleCopyMessage = async () => {
    const success = await shareEngine.copyToClipboard(emergencyMessage);
    if (success) {
      setCopied(true);
      showToast(t.appName, 'SOS Message copied', 'urgent');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDirectCall = () => {
    if (priority1Contact) {
      window.location.href = `tel:${priority1Contact.phone}`;
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    closeSOSModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-dark-surface via-dark-surface to-dark-card border-2 border-red-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SOS Alert Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 text-white shadow-xl shadow-red-500/40 mb-3 animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">
          {t.sosConfirmTitle}
        </h3>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          {t.sosConfirmDesc}
        </p>

        {/* GPS Coordinates Badge */}
        <div className="p-3.5 rounded-2xl bg-dark-bg/80 border border-dark-border mb-6 text-left">
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Current Emergency Coordinates</span>
          </div>
          <p className="text-xs font-mono text-slate-200">
            {lat !== 0 ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Detecting GPS position...'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Google Maps link automatically included in SOS dispatch.
          </p>
        </div>

        {/* Primary Contact Target */}
        {priority1Contact ? (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/25 mb-6 text-left">
            <span className="text-[10px] font-bold uppercase text-red-400 tracking-wider block">
              Primary Emergency Contact (Priority 1)
            </span>
            <p className="text-sm font-bold text-white mt-0.5">{priority1Contact.name}</p>
            <p className="text-xs text-slate-300">{priority1Contact.phone}</p>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 mb-6 text-left">
            <p className="text-xs text-amber-300 font-medium">
              No Priority 1 contact configured. Message can still be shared via WhatsApp.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {priority1Contact && (
            <button
              onClick={handleDirectCall}
              className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Call Primary Contact ({priority1Contact.phone})</span>
            </button>
          )}

          <button
            onClick={handleWhatsAppDispatch}
            className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-[#25D366]/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            <span>Send SOS Message on WhatsApp</span>
          </button>

          <button
            onClick={handleCopyMessage}
            className="w-full py-2.5 px-3 rounded-xl bg-dark-card hover:bg-dark-hover text-slate-200 border border-dark-border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Emergency Message Copied' : 'Copy Emergency SOS Message'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
