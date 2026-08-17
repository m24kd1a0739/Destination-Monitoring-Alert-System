import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useJourney } from '../../context/JourneyContext';
import { useSettings } from '../../context/SettingsContext';
import { shareEngine } from '../../services/shareEngine';
import { Share2, Copy, Check, X, Send } from 'lucide-react';

interface ShareModalProps {
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useSettings();
  const { activeJourney, showToast } = useJourney();

  const [copied, setCopied] = useState(false);

  if (!activeJourney || !user) return null;

  const shareText = shareEngine.getLiveJourneyText(activeJourney, user, language);

  const handleWhatsApp = () => {
    shareEngine.shareViaWhatsApp(shareText);
  };

  const handleWebShare = async () => {
    const success = await shareEngine.shareViaWebShare(t.shareLiveJourneyTitle, shareText);
    if (!success) {
      handleWhatsApp();
    }
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
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.shareLiveJourneyTitle}</h3>
              <p className="text-[11px] text-slate-400">Language-aware transit sharing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection for Shared Message */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Message Language:
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(['en', 'te', 'hi', 'ta', 'kn'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  language === l
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                    : 'bg-dark-card text-slate-400 hover:text-slate-200 border-dark-border'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="p-4 rounded-2xl bg-dark-bg/80 border border-dark-border text-xs text-slate-200 whitespace-pre-line font-mono mb-5 max-h-48 overflow-y-auto leading-relaxed shadow-inner">
          {shareText}
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          {/* WhatsApp Direct Share */}
          <button
            onClick={handleWhatsApp}
            className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-sm shadow-lg shadow-[#25D366]/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            <span>{t.shareViaWhatsApp}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleWebShare}
              className="py-2.5 px-3 rounded-xl bg-dark-card hover:bg-dark-hover text-slate-200 border border-dark-border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.shareViaWebShare}</span>
            </button>

            <button
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-xl bg-dark-card hover:bg-dark-hover text-slate-200 border border-dark-border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : t.copyLink}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
