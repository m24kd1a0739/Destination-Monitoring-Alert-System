import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Volume2, 
  Vibrate, 
  Bell, 
  Moon, 
  ShieldCheck, 
  MapPin, 
  Trash2, 
  User, 
  LogOut, 
  Check, 
  AlertCircle, 
  Play, 
  Info,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJourney } from '../../context/JourneyContext';
import { useSettings } from '../../context/SettingsContext';
import { voiceEngine, LANGUAGE_LOCALE_MAP } from '../../i18n/voice';
import { geolocationService, GeolocationPermissionState } from '../../services/geolocation';
import { Language } from '../../types';

interface SettingsViewProps {
  onOpenEditProfile: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenEditProfile }) => {
  const { user, logout } = useAuth();
  const { 
    language, 
    setLanguage, 
    voiceLanguage, 
    setVoiceLanguage, 
    alertSettings, 
    updateAlertSettings, 
    resetAllSettings, 
    t 
  } = useSettings();
  const { showToast, refreshGPS } = useJourney();

  const [voiceTestResult, setVoiceTestResult] = useState<{ isTesting: boolean; message: string | null; isSuccess: boolean }>({
    isTesting: false,
    message: null,
    isSuccess: true
  });

  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const [geoPermission, setGeoPermission] = useState<GeolocationPermissionState>('prompt');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    geolocationService.checkPermission().then((s) => setGeoPermission(s));
  }, []);

  const languagesList: { id: Language; label: string; native: string }[] = [
    { id: 'en', label: 'English', native: 'English (India)' },
    { id: 'te', label: 'Telugu', native: 'తెలుగు (Telugu)' },
    { id: 'hi', label: 'Hindi', native: 'हिन्दी (Hindi)' },
    { id: 'ta', label: 'Tamil', native: 'தமிழ் (Tamil)' },
    { id: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ (Kannada)' },
  ];

  const handleTestVoice = () => {
    setVoiceTestResult({ isTesting: true, message: null, isSuccess: true });
    
    const sampleTexts: Record<Language, string> = {
      en: "This is a test announcement for Destination Monitor. Your bus stop is approaching in 5 minutes.",
      te: "ఇది గమ్యస్థాన పర్యవేక్షణ పరీక్షా ప్రకటన. మీ బస్సు స్టాప్ 5 నిమిషాల్లో రాబోతోంది.",
      hi: "यह डेस्टिनेशन मॉनिटर की परीक्षण घोषणा है। आपका बस स्टॉप 5 मिनट में आने वाला है।",
      ta: "இது இலக்கு கண்காணிப்பாளரின் சோதனை அறிவிப்பு. உங்கள் பேருந்து நிறுத்தம் இன்னும் 5 நிமிடங்களில் வரவுள்ளது.",
      kn: "ಇದು ಗಮ್ಯಸ್ಥಾನ ಮಾನಿಟರ್ ಪರೀಕ್ಷಾ ಪ್ರಕಟಣೆ. ನಿಮ್ಮ ಬಸ್ ನಿಲ್ದಾಣ 5 ನಿಮಿಷಗಳಲ್ಲಿ ಬರಲಿದೆ."
    };

    const res = voiceEngine.speak(sampleTexts[voiceLanguage], voiceLanguage, {
      onEnd: () => {
        setVoiceTestResult((prev) => ({ ...prev, isTesting: false }));
      },
      onError: (err) => {
        setVoiceTestResult({ isTesting: false, message: `Voice error: ${err}`, isSuccess: false });
      }
    });

    setVoiceTestResult({
      isTesting: true,
      message: res.message || null,
      isSuccess: res.success
    });

    if (!res.success) {
      showToast(t.appName, res.message || 'Voice pack unavailable', 'warning');
    }
  };

  const handleRequestNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Notifications', 'Web Notifications not supported by this browser.', 'warning');
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      updateAlertSettings({ notificationsEnabled: true });
      showToast(t.appName, 'Notifications enabled', 'success');
    }
  };

  const handleRetryLocation = async () => {
    const coords = await refreshGPS();
    if (coords) {
      setGeoPermission('granted');
      showToast(t.appName, t.locationAccessEnabled, 'success');
    } else {
      setGeoPermission('denied');
      showToast('GPS Required', t.locationPermissionRequired, 'warning');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brand-400" />
          <span>{t.settings}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure multilingual speech synthesis, wake-up alert thresholds & permissions.
        </p>
      </div>

      {/* User Profile Card */}
      {user && (
        <div className="p-5 rounded-3xl bg-dark-surface border border-dark-border shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center font-black text-lg shadow-md shadow-brand-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{user.name}</h3>
              <p className="text-xs text-slate-400">{user.phone}</p>
            </div>
          </div>
          <button
            onClick={onOpenEditProfile}
            className="py-2 px-3.5 rounded-xl bg-dark-card hover:bg-dark-hover text-slate-200 border border-dark-border text-xs font-semibold transition-colors"
          >
            {t.editProfile}
          </button>
        </div>
      )}

      {/* 1. App Display Language */}
      <div className="p-5 rounded-3xl bg-dark-surface border border-dark-border shadow-lg space-y-3">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t.language}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {languagesList.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLanguage(l.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                language === l.id
                  ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/25'
                  : 'bg-dark-card text-slate-300 hover:text-white border-dark-border'
              }`}
            >
              <span className="text-xs font-bold block">{l.native}</span>
              <span className="text-[10px] opacity-75">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Voice Alert Language & Test Voice Engine */}
      <div className="p-5 rounded-3xl bg-dark-surface border border-dark-border shadow-lg space-y-4">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t.voiceLanguage}</h3>
        </div>
        <p className="text-xs text-slate-400">
          Select native voice synthesis engine for spoken 5-minute, 2-minute, and arrival announcements.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {languagesList.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setVoiceLanguage(l.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                voiceLanguage === l.id
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/25'
                  : 'bg-dark-card text-slate-300 hover:text-white border-dark-border'
              }`}
            >
              <span className="text-xs font-bold block">{l.native}</span>
              <span className="text-[10px] opacity-75">{LANGUAGE_LOCALE_MAP[l.id].primary}</span>
            </button>
          ))}
        </div>

        {/* Test Voice Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleTestVoice}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t.testVoice}</span>
          </button>

          {voiceTestResult.message && (
            <div className={`mt-3 p-3 rounded-xl border text-xs font-medium ${
              voiceTestResult.isSuccess
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
            }`}>
              <p>{voiceTestResult.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Alert Timing Thresholds */}
      <div className="p-5 rounded-3xl bg-dark-surface border border-dark-border shadow-lg space-y-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t.alertTiming}</h3>
        </div>

        <div className="space-y-2.5">
          {/* 5-Min Alert */}
          <label className="flex items-center justify-between p-3 rounded-2xl bg-dark-card border border-dark-border cursor-pointer hover:bg-dark-hover transition-colors">
            <div>
              <span className="text-xs font-bold text-white block">{t.fiveMinAlert}</span>
              <span className="text-[11px] text-slate-400">Trigger voice & notification 5 mins before stop</span>
            </div>
            <input
              type="checkbox"
              checked={alertSettings.alert5Min}
              onChange={(e) => updateAlertSettings({ alert5Min: e.target.checked })}
              className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-dark-surface border-dark-border"
            />
          </label>

          {/* 2-Min Alert */}
          <label className="flex items-center justify-between p-3 rounded-2xl bg-dark-card border border-dark-border cursor-pointer hover:bg-dark-hover transition-colors">
            <div>
              <span className="text-xs font-bold text-white block">{t.twoMinAlert}</span>
              <span className="text-[11px] text-slate-400">Strong alarm & vibration 2 mins before stop</span>
            </div>
            <input
              type="checkbox"
              checked={alertSettings.alert2Min}
              onChange={(e) => updateAlertSettings({ alert2Min: e.target.checked })}
              className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-dark-surface border-dark-border"
            />
          </label>

          {/* 10-Min Alert */}
          <label className="flex items-center justify-between p-3 rounded-2xl bg-dark-card border border-dark-border cursor-pointer hover:bg-dark-hover transition-colors">
            <div>
              <span className="text-xs font-bold text-white block">{t.tenMinAlert}</span>
              <span className="text-[11px] text-slate-400">Early reminder for long distance bus routes</span>
            </div>
            <input
              type="checkbox"
              checked={alertSettings.alert10Min}
              onChange={(e) => updateAlertSettings({ alert10Min: e.target.checked })}
              className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-dark-surface border-dark-border"
            />
          </label>
        </div>
      </div>

      {/* 4. Nap Mode & Device Alerts */}
      <div className="p-5 rounded-3xl bg-dark-surface border border-dark-border shadow-lg space-y-3">
        <div className="flex items-center space-x-2">
          <Moon className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nap Mode & Hardware Sensors</h3>
        </div>

        <div className="space-y-2.5">
          {/* Nap Mode Toggle */}
          <label className="flex items-center justify-between p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 cursor-pointer hover:bg-indigo-950/30 transition-colors">
            <div>
              <span className="text-xs font-bold text-white block">{t.napMode}</span>
              <span className="text-[11px] text-slate-300">{t.napModeDesc}</span>
            </div>
            <input
              type="checkbox"
              checked={alertSettings.napMode}
              onChange={(e) => updateAlertSettings({ napMode: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 bg-dark-surface border-dark-border"
            />
          </label>

          {/* Vibration Toggle */}
          <label className="flex items-center justify-between p-3 rounded-2xl bg-dark-card border border-dark-border cursor-pointer hover:bg-dark-hover transition-colors">
            <div>
              <span className="text-xs font-bold text-white block">{t.vibration}</span>
              <span className="text-[11px] text-slate-400">Tactile vibration alert sequence on arrival & 2-min warning</span>
            </div>
            <input
              type="checkbox"
              checked={alertSettings.vibrationEnabled}
              onChange={(e) => updateAlertSettings({ vibrationEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-dark-surface border-dark-border"
            />
          </label>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-dark-card border border-dark-border">
            <div>
              <span className="text-xs font-bold text-white block">{t.notifications}</span>
              <span className="text-[11px] text-slate-400">Status: {notifPermission}</span>
            </div>
            {notifPermission !== 'granted' ? (
              <button
                type="button"
                onClick={handleRequestNotifications}
                className="py-1 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold"
              >
                Enable
              </button>
            ) : (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5. Location Permission Status */}
      <div className="p-5 rounded-3xl bg-dark-surface border border-dark-border shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-white block">GPS Location Permission</span>
          <span className="text-[11px] text-slate-400">Status: {geoPermission}</span>
        </div>
        <button
          type="button"
          onClick={handleRetryLocation}
          className="py-1.5 px-3 rounded-xl bg-dark-card hover:bg-dark-hover text-brand-400 border border-dark-border text-xs font-semibold"
        >
          Check GPS
        </button>
      </div>

      {/* 6. Privacy & Data Reset */}
      <div className="p-5 rounded-3xl bg-dark-surface border border-dark-border shadow-lg space-y-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t.privacyTitle}</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {t.privacyDesc}
        </p>

        <div className="pt-2 flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-xs font-bold transition-colors"
          >
            {t.clearData}
          </button>
          <button
            type="button"
            onClick={logout}
            className="py-2.5 px-4 rounded-xl bg-dark-card hover:bg-dark-hover text-slate-300 border border-dark-border text-xs font-semibold transition-colors"
          >
            {t.logout}
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-dark-surface border border-dark-border rounded-3xl p-6 shadow-2xl text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-2">{t.clearData}?</h3>
            <p className="text-xs text-slate-400 mb-5">
              This will reset your local profile, favourite routes, emergency contacts, and journey history.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-dark-card text-xs text-slate-300 border border-dark-border"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  resetAllSettings();
                  setShowResetConfirm(false);
                  showToast(t.appName, 'All local data reset', 'info');
                }}
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
