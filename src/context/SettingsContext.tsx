import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations, TranslationSchema } from '../i18n/translations';
import { storage } from '../services/storage';
import { AlertSettings, EmergencyContact, Language } from '../types';

interface SettingsContextType {
  language: Language;
  voiceLanguage: Language;
  alertSettings: AlertSettings;
  emergencyContacts: EmergencyContact[];
  t: TranslationSchema;
  setLanguage: (lang: Language) => void;
  setVoiceLanguage: (lang: Language) => void;
  updateAlertSettings: (updates: Partial<AlertSettings>) => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  updateEmergencyContact: (contact: EmergencyContact) => void;
  deleteEmergencyContact: (id: string) => void;
  reorderEmergencyContacts: (contacts: EmergencyContact[]) => void;
  resetAllSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => storage.getAppLanguage());
  const [voiceLanguage, setVoiceLanguageState] = useState<Language>(() => storage.getVoiceLanguage());
  const [alertSettings, setAlertSettings] = useState<AlertSettings>(() => storage.getAlertSettings());
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => storage.getEmergencyContacts());

  const t = translations[language] || translations.en;

  const setLanguage = (lang: Language) => {
    storage.saveAppLanguage(lang);
    setLanguageState(lang);
  };

  const setVoiceLanguage = (lang: Language) => {
    storage.saveVoiceLanguage(lang);
    setVoiceLanguageState(lang);
  };

  const updateAlertSettings = (updates: Partial<AlertSettings>) => {
    setAlertSettings(prev => {
      const next = { ...prev, ...updates };
      storage.saveAlertSettings(next);
      return next;
    });
  };

  const addEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: `contact-${Date.now()}`
    };
    const updated = [...emergencyContacts, newContact].sort((a, b) => a.priority - b.priority);
    storage.saveEmergencyContacts(updated);
    setEmergencyContacts(updated);
  };

  const updateEmergencyContact = (contact: EmergencyContact) => {
    const updated = emergencyContacts
      .map(c => (c.id === contact.id ? contact : c))
      .sort((a, b) => a.priority - b.priority);
    storage.saveEmergencyContacts(updated);
    setEmergencyContacts(updated);
  };

  const deleteEmergencyContact = (id: string) => {
    const updated = emergencyContacts.filter(c => c.id !== id);
    storage.saveEmergencyContacts(updated);
    setEmergencyContacts(updated);
  };

  const reorderEmergencyContacts = (contacts: EmergencyContact[]) => {
    storage.saveEmergencyContacts(contacts);
    setEmergencyContacts(contacts);
  };

  const resetAllSettings = () => {
    storage.clearAllData();
    setLanguageState('en');
    setVoiceLanguageState('en');
    setAlertSettings(storage.getAlertSettings());
    setEmergencyContacts([]);
  };

  return (
    <SettingsContext.Provider
      value={{
        language,
        voiceLanguage,
        alertSettings,
        emergencyContacts,
        t,
        setLanguage,
        setVoiceLanguage,
        updateAlertSettings,
        addEmergencyContact,
        updateEmergencyContact,
        deleteEmergencyContact,
        reorderEmergencyContacts,
        resetAllSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
