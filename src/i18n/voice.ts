import { Language } from '../types';

export interface VoiceAvailability {
  supported: boolean;
  voiceName: string | null;
  langTag: string;
  isExactLanguageMatch: boolean;
}

const LANGUAGE_LOCALE_MAP: Record<Language, { primary: string; codes: string[]; name: string }> = {
  en: { primary: 'en-IN', codes: ['en-IN', 'en_IN', 'en-US', 'en-GB', 'en'], name: 'English (India)' },
  te: { primary: 'te-IN', codes: ['te-IN', 'te_IN', 'te'], name: 'Telugu (తెలుగు)' },
  hi: { primary: 'hi-IN', codes: ['hi-IN', 'hi_IN', 'hi'], name: 'Hindi (हिन्दी)' },
  ta: { primary: 'ta-IN', codes: ['ta-IN', 'ta_IN', 'ta'], name: 'Tamil (தமிழ்)' },
  kn: { primary: 'kn-IN', codes: ['kn-IN', 'kn_IN', 'kn'], name: 'Kannada (ಕನ್ನಡ)' }
};

class VoiceEngine {
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices();
    if (this.voices.length > 0) {
      this.voicesLoaded = true;
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices;
  }

  public findVoiceForLanguage(lang: Language): { voice: SpeechSynthesisVoice | null; availability: VoiceAvailability } {
    const config = LANGUAGE_LOCALE_MAP[lang];
    const available = this.getAvailableVoices();

    // 1. Try exact primary match (e.g. te-IN)
    let matched = available.find(v => v.lang.toLowerCase() === config.primary.toLowerCase() || v.lang.replace('_', '-').toLowerCase() === config.primary.toLowerCase());

    // 2. Try prefix match (e.g. te)
    if (!matched) {
      matched = available.find(v => config.codes.some(c => v.lang.toLowerCase().startsWith(c.toLowerCase().split('-')[0])));
    }

    // 3. Try name substring match (e.g. "Telugu")
    if (!matched) {
      const nameKey = config.name.split(' ')[0].toLowerCase();
      matched = available.find(v => v.name.toLowerCase().includes(nameKey));
    }

    const hasMatch = Boolean(matched);

    return {
      voice: matched || null,
      availability: {
        supported: hasMatch,
        voiceName: matched ? matched.name : null,
        langTag: config.primary,
        isExactLanguageMatch: hasMatch
      }
    };
  }

  public speak(
    text: string,
    lang: Language,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): { success: boolean; message?: string } {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return { success: false, message: "Speech Synthesis not supported by this browser." };
    }

    const { voice, availability } = this.findVoiceForLanguage(lang);

    // Cancel any active utterance
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 0.95; // slightly slower for transit clarity
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = options?.volume ?? 1.0;

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      // Set the intended lang tag even if specific voice object is not registered
      utterance.lang = LANGUAGE_LOCALE_MAP[lang].primary;
    }

    if (options?.onEnd) {
      utterance.onend = () => options.onEnd?.();
    }
    if (options?.onError) {
      utterance.onerror = (e) => options.onError?.(e);
    }

    try {
      window.speechSynthesis.speak(utterance);
      return {
        success: availability.supported,
        message: availability.supported
          ? `Voice playback started using ${voice?.name}`
          : `${LANGUAGE_LOCALE_MAP[lang].name} voice is not available on this device/browser.`
      };
    } catch (err) {
      return {
        success: false,
        message: `Failed to speak announcement: ${err}`
      };
    }
  }

  public cancel() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceEngine = new VoiceEngine();
export { LANGUAGE_LOCALE_MAP };
