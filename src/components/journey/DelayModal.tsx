import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useJourney } from '../../context/JourneyContext';
import { useSettings } from '../../context/SettingsContext';
import { shareEngine } from '../../services/shareEngine';
import { Clock, Send, X, Copy, Check } from 'lucide-react';

interface DelayModalProps {
  onClose: () => void;
}

export const DelayModal: React.FC<DelayModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useSettings();
  const { activeJourney, showToast } = useJourney();

  const [copied, setCopied] = useState(false);

  if (!activeJourney || !user) return null;

  const shareText = shareEngine.getDelayText(activeJourney, user, language);

  const handleWhatsApp = () => {
    shareEngine.shareViaWhatsApp(shareText);
  };

  const handleCopy = async () => {
    const success = await shareEngine.copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      showToast(t.appName, t.linkCopied, 'success');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-3xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.journeyDelayedMsg}</h3>
              <p className="text-[11px] text-slate-400">Notify contacts about travel delay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="mb-4">
          <div className="grid grid-cols-5 gap-1.5">
            {(['en', 'te', 'hi', 'ta', 'kn'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  language === l
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                    : 'bg-dark-card text-slate-400 hover:text-slate-200 border-dark-border'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Message Preview */}
        <div className="p-4 rounded-2xl bg-dark-bg/80 border border-dark-border text-xs text-slate-200 whitespace-pre-line font-mono mb-5 max-h-48 overflow-y-auto leading-relaxed shadow-inner">
          {shareText}
        </div>

        {/* Action */}
        <div className="space-y-2.5">
          <button
            onClick={handleWhatsApp}
            className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-sm shadow-lg shadow-[#25D366]/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            <span>Share Delay on WhatsApp</span>
          </button>

          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-3 rounded-xl bg-dark-card hover:bg-dark-hover text-slate-200 border border-dark-border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Delay Message'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
