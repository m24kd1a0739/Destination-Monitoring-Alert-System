import { translations } from '../i18n/translations';
import { ActiveJourney, Language, UserProfile } from '../types';

export interface ShareResult {
  success: boolean;
  method: 'web-share' | 'whatsapp' | 'clipboard';
  message?: string;
}

export class ShareEngine {
  public formatMapUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
  }

  public getLiveJourneyText(journey: ActiveJourney, user: UserProfile, lang: Language): string {
    const t = translations[lang];
    const coords = journey.currentLocation || { lat: journey.source.lat, lng: journey.source.lng };
    const mapUrl = this.formatMapUrl(coords.lat, coords.lng);
    const etaStr = journey.eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const statusStr = t[(`${journey.status}Status` as keyof typeof t) as any] || journey.status.toUpperCase();

    return t.shareLiveMessage(
      user.name,
      journey.destination.name,
      etaStr,
      journey.mode,
      statusStr as string,
      mapUrl
    );
  }

  public getArrivalText(journey: ActiveJourney, user: UserProfile, lang: Language): string {
    const t = translations[lang];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return t.shareArrivalMessage(user.name, journey.destination.name, timeStr);
  }

  public getDelayText(journey: ActiveJourney, user: UserProfile, lang: Language): string {
    const t = translations[lang];
    const originalEtaStr = new Date(journey.startTime + journey.initialDuration * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    const updatedEtaStr = journey.eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return t.shareDelayMessage(
      user.name,
      journey.destination.name,
      originalEtaStr,
      updatedEtaStr,
      journey.delayMinutes
    );
  }

  public getEmergencyText(user: UserProfile, lat: number, lng: number, lang: Language): string {
    const t = translations[lang];
    const mapUrl = this.formatMapUrl(lat, lng);
    return t.shareEmergencyMessage(user.name, lat, lng, mapUrl);
  }

  public async shareViaWebShare(title: string, text: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text });
        return true;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Web Share API error:', err);
        }
        return false;
      }
    }
    return false;
  }

  public shareViaWhatsApp(text: string): void {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  public async copyToClipboard(text: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export const shareEngine = new ShareEngine();
