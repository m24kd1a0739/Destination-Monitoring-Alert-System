import React, { useState } from 'react';
import { X, Share2, MessageCircle, Copy, Check } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { BusInfo, BusStop } from '../../types';
import { shareEngine } from '../../services/shareEngine';

interface BusShareModalProps {
  bus: BusInfo;
  selectedStop: BusStop | null;
  onClose: () => void;
}

export const BusShareModal: React.FC<BusShareModalProps> = ({ bus, selectedStop, onClose }) => {
  const { t, language } = useSettings();
  const [copied, setCopied] = useState(false);

  const statusLabel = 
    bus.status === 'arrived' 
      ? t.arrived 
      : bus.status === 'delayed' 
      ? `${t.delayed} (+${bus.delayMinutes}m)` 
      : bus.status === 'approaching' 
      ? t.approaching 
      : t.onTime;

  const myStopLabel = selectedStop ? selectedStop.name : bus.destination.name;

  const shareText = t.shareBusMessage(
    bus.busNumber,
    bus.routeName,
    bus.currentLocation.name,
    bus.nextStop.name,
    bus.expectedArrivalTime,
    myStopLabel,
    statusLabel
  );

  const handleWebShare = async () => {
    const success = await shareEngine.shareViaWebShare(`Live Bus Tracking - ${bus.busNumber}`, shareText);
    if (success) {
      onClose();
    }
  };

  const handleWhatsApp = () => {
    shareEngine.shareViaWhatsApp(shareText);
  };

  const handleCopy = async () => {
    const ok = await shareEngine.copyToClipboard(shareText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const canWebShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-dark-surface border border-dark-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.shareBusStatus}</h3>
              <p className="text-xs text-slate-400">{bus.busNumber} • {bus.routeName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Preview Box */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Status Message Preview
          </div>
          <div className="p-4 rounded-2xl bg-dark-bg/80 border border-dark-border/80 text-xs font-mono text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed shadow-inner">
            {shareText}
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {canWebShare && (
            <button
              onClick={handleWebShare}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-600/30 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>{t.shareViaWebShare}</span>
            </button>
          )}

          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30 active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t.shareViaWhatsApp}</span>
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border font-semibold text-sm transition-all active:scale-95 ${
              canWebShare ? 'sm:col-span-2' : ''
            } ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-dark-card hover:bg-dark-hover border-dark-border text-slate-200'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t.linkCopied : t.copyLink}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
