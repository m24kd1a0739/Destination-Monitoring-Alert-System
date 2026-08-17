import { Coordinates } from '../types';

export type GeolocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface GeolocationErrorState {
  code: number;
  message: string;
  isDenied: boolean;
}

class GeolocationService {
  private watchId: number | null = null;

  public async checkPermission(): Promise<GeolocationPermissionState> {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return 'unsupported';
    }

    if ('permissions' in navigator && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' as any });
        return status.state as GeolocationPermissionState;
      } catch {
        return 'prompt';
      }
    }

    return 'prompt';
  }

  public getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('geolocation' in navigator)) {
        reject({ code: 0, message: 'Geolocation is not supported by this browser.', isDenied: false });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp
          });
        },
        (err) => {
          reject({
            code: err.code,
            message: err.message || 'Unable to retrieve location.',
            isDenied: err.code === err.PERMISSION_DENIED
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    });
  }

  public startWatching(
    onLocation: (coords: Coordinates) => void,
    onError: (err: GeolocationErrorState) => void
  ): number | null {
    this.stopWatching();

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      onError({ code: 0, message: 'Geolocation not supported', isDenied: false });
      return null;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        onLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          timestamp: pos.timestamp
        });
      },
      (err) => {
        onError({
          code: err.code,
          message: err.message || 'Error tracking GPS location',
          isDenied: err.code === err.PERMISSION_DENIED
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000
      }
    );

    return this.watchId;
  }

  public stopWatching() {
    if (this.watchId !== null && typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  public isTracking(): boolean {
    return this.watchId !== null;
  }
}

export const geolocationService = new GeolocationService();
