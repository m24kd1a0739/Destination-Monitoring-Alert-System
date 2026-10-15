import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Navigation, User, Phone, ArrowRight, ShieldCheck, MapPin, BellRing, Sparkles } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { login } = useAuth();
  const { t, language, setLanguage } = useSettings();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.nameRequired);
      return;
    }
    if (!phone.trim() || phone.trim().length < 6) {
      setError(t.phoneRequired);
      return;
    }

    setError(null);
    login(name, phone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/95 backdrop-blur-xl overflow-y-auto">
      <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto">
        
        {/* Language Quick Switcher */}
        <div className="flex justify-end mb-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-dark-card border border-dark-border text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="en">English (English)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
          </select>
        </div>

        {/* Hero Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-xl shadow-brand-500/25 mb-4">
            <Navigation className="w-8 h-8 -rotate-45" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {t.appName}
          </h2>
          <p className="text-xs sm:text-sm text-brand-400 font-medium mt-1">
            {t.appSubtitle}
          </p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {t.welcomeSubtitle}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
          <div className="p-2.5 rounded-xl bg-dark-card border border-dark-border">
            <MapPin className="w-4 h-4 text-brand-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-300 font-medium block">Live GPS</span>
          </div>
          <div className="p-2.5 rounded-xl bg-dark-card border border-dark-border">
            <BellRing className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-300 font-medium block">Voice Alerts</span>
          </div>
          <div className="p-2.5 rounded-xl bg-dark-card border border-dark-border">
            <ShieldCheck className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-300 font-medium block">Safety Circle</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.fullName} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.enterFullName}
                className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.phoneNumber} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.enterPhoneNumber}
                className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <span>{t.continueBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Instant Guest Access Button */}
          <button
            type="button"
            onClick={() => login('Passenger', '+91 98765 43210')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 flex items-center justify-center space-x-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Instant Access / Explore Dashboard</span>
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center mt-5">
          Your profile is stored locally on this device for safety alerts.
        </p>

      </div>
    </div>
  );
};
