import { AlertSettings, EmergencyContact, FavouriteRoute, JourneyHistoryRecord, Language, UserProfile } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'dm_user_profile',
  FAVOURITES: 'dm_favourite_routes',
  HISTORY: 'dm_journey_history',
  CONTACTS: 'dm_emergency_contacts',
  SETTINGS: 'dm_alert_settings',
  APP_LANG: 'dm_app_language',
  VOICE_LANG: 'dm_voice_language',
  ACTIVE_JOURNEY: 'dm_active_journey'
};

const DEFAULT_SETTINGS: AlertSettings = {
  alert10Min: false,
  alert5Min: true,
  alert2Min: true,
  vibrationEnabled: true,
  voiceEnabled: true,
  notificationsEnabled: true,
  napMode: false,
  arrivalRadiusMeters: 75,
  offRouteThresholdMeters: 250
};

export const storage = {
  getUserProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  clearUserProfile(): void {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  },

  getAlertSettings(): AlertSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveAlertSettings(settings: AlertSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getEmergencyContacts(): EmergencyContact[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveEmergencyContacts(contacts: EmergencyContact[]): void {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  },

  getFavouriteRoutes(): FavouriteRoute[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVOURITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveFavouriteRoute(route: FavouriteRoute): void {
    const list = this.getFavouriteRoutes().filter(r => r.id !== route.id);
    list.unshift(route);
    localStorage.setItem(STORAGE_KEYS.FAVOURITES, JSON.stringify(list));
  },

  deleteFavouriteRoute(id: string): void {
    const list = this.getFavouriteRoutes().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.FAVOURITES, JSON.stringify(list));
  },

  getJourneyHistory(): JourneyHistoryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addJourneyHistoryRecord(record: JourneyHistoryRecord): void {
    const list = this.getJourneyHistory();
    list.unshift(record);
    // Keep max 50 recent records
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list.slice(0, 50)));
  },

  clearJourneyHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  },

  getAppLanguage(): Language {
    const lang = localStorage.getItem(STORAGE_KEYS.APP_LANG) as Language;
    return ['en', 'te', 'hi', 'ta', 'kn'].includes(lang) ? lang : 'en';
  },

  saveAppLanguage(lang: Language): void {
    localStorage.setItem(STORAGE_KEYS.APP_LANG, lang);
  },

  getVoiceLanguage(): Language {
    const lang = localStorage.getItem(STORAGE_KEYS.VOICE_LANG) as Language;
    return ['en', 'te', 'hi', 'ta', 'kn'].includes(lang) ? lang : this.getAppLanguage();
  },

  saveVoiceLanguage(lang: Language): void {
    localStorage.setItem(STORAGE_KEYS.VOICE_LANG, lang);
  },

  clearAllData(): void {
    localStorage.clear();
  }
};
