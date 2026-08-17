import { translations } from '../i18n/translations';
import { voiceEngine } from '../i18n/voice';
import { ActiveJourney, AlertSettings, Coordinates, Language, StopInfo } from '../types';
import { audioEngine } from './audioEngine';
import {
  calculateCrossTrackDistance,
  calculateHaversineDistance,
  calculateRemainingPolylineDistance
} from './routing';

export interface AlertTriggerEvent {
  type: '10min' | '5min' | '2min' | 'reached' | 'offRoute' | 'delay';
  title: string;
  message: string;
  isUrgent?: boolean;
}

export class AlertEngine {
  public triggerNotification(title: string, body: string) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/logo.svg',
          badge: '/logo.svg',
          tag: 'dest-monitor-alert'
        });
      } catch (err) {
        console.warn('Web notification error:', err);
      }
    }
  }

  public triggerVibration(pattern: number[] = [300, 200, 300]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        console.warn('Vibration note:', err);
      }
    }
  }

  public processGPSUpdate(
    coords: Coordinates,
    journey: ActiveJourney,
    settings: AlertSettings,
    lang: Language,
    voiceLang: Language,
    onAlert: (event: AlertTriggerEvent) => void,
    onNapWakeUp?: () => void
  ): {
    updatedJourney: ActiveJourney;
    alertsTriggered: ActiveJourney['alertsTriggered'];
  } {
    const t = translations[lang];
    const alerts = { ...journey.alertsTriggered };

    // 1. Calculate remaining distance along planned polyline
    const remainingDistance = calculateRemainingPolylineDistance(
      coords.lat,
      coords.lng,
      journey.destination.lat,
      journey.destination.lng,
      journey.selectedRoute.coordinates
    );

    // Direct distance to destination for arrival radius check
    const directDistanceToDest = calculateHaversineDistance(
      coords.lat,
      coords.lng,
      journey.destination.lat,
      journey.destination.lng
    );

    // 2. Dynamic Remaining Duration & ETA calculation
    // Calculate speed (fallback to route average speed if current GPS speed is stationary/unknown)
    const baseSpeed = journey.selectedRoute.distance / Math.max(journey.selectedRoute.duration, 60); // m/s
    const currentSpeed = coords.speed && coords.speed > 1.5 ? coords.speed : baseSpeed;
    const remainingDuration = Math.round(remainingDistance / Math.max(currentSpeed, 1.0));

    const now = Date.now();
    const eta = new Date(now + remainingDuration * 1000);

    // 3. Progress percentage
    const totalDist = journey.selectedRoute.distance || 1;
    const progressPercent = Math.min(100, Math.max(0, Math.round(((totalDist - remainingDistance) / totalDist) * 100)));

    // 4. Update stops passed state
    let nextStop: StopInfo | null = null;
    const updatedStops = journey.stops.map((stop) => {
      const distToStop = calculateHaversineDistance(coords.lat, coords.lng, stop.lat, stop.lng);
      const isPassed = distToStop < 100 || (stop.distanceFromStart < (totalDist - remainingDistance) && distToStop < 300);
      return { ...stop, passed: isPassed };
    });

    // Find the next upcoming unpassed stop
    nextStop = updatedStops.find((s) => !s.passed) || null;

    // 5. Cross-track off-route detection
    const { minDistance } = calculateCrossTrackDistance(
      coords.lat,
      coords.lng,
      journey.selectedRoute.coordinates
    );
    const isOffRoute = minDistance > settings.offRouteThresholdMeters;

    if (isOffRoute && !alerts.offRoute) {
      alerts.offRoute = true;
      audioEngine.playWarningTone();
      if (settings.vibrationEnabled) this.triggerVibration([200, 100, 200]);
      if (settings.notificationsEnabled) {
        this.triggerNotification(t.appName, t.offRouteWarning);
      }
      if (settings.voiceEnabled) {
        voiceEngine.speak(t.offRouteWarning, voiceLang);
      }
      onAlert({
        type: 'offRoute',
        title: 'Off-Route Alert',
        message: t.offRouteWarning
      });
    }

    // 6. Delay detection
    const originalExpectedEndTime = journey.startTime + journey.initialDuration * 1000;
    const currentExpectedEndTime = eta.getTime();
    const delaySeconds = (currentExpectedEndTime - originalExpectedEndTime) / 1000;
    const delayMinutes = Math.round(delaySeconds / 60);
    const isDelayed = delayMinutes >= 5;

    if (isDelayed && !alerts.delay) {
      alerts.delay = true;
      onAlert({
        type: 'delay',
        title: t.journeyDelayedMsg,
        message: `${t.originalEta}: ${new Date(originalExpectedEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → ${t.updatedEta}: ${eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      });
    }

    // 7. Destination Arrival check
    const isReached = directDistanceToDest <= settings.arrivalRadiusMeters;

    if (isReached && !alerts.reached) {
      alerts.reached = true;
      audioEngine.playArrivalCelebration();
      if (settings.vibrationEnabled) this.triggerVibration([500, 200, 500, 200, 800]);
      if (settings.notificationsEnabled) {
        this.triggerNotification(t.destinationReached, t.destinationReachedMsg);
      }
      if (settings.voiceEnabled) {
        voiceEngine.speak(t.destinationReachedMsg, voiceLang);
      }
      if (settings.napMode && onNapWakeUp) {
        onNapWakeUp();
      }
      onAlert({
        type: 'reached',
        title: t.destinationReached,
        message: t.destinationReachedMsg,
        isUrgent: true
      });

      return {
        updatedJourney: {
          ...journey,
          currentLocation: coords,
          remainingDistance: 0,
          remainingDuration: 0,
          eta: new Date(),
          progressPercent: 100,
          status: 'reached',
          endTime: now,
          nextStop: null,
          stops: updatedStops,
          isOffRoute: false,
          isDelayed,
          delayMinutes,
          alertsTriggered: alerts
        },
        alertsTriggered: alerts
      };
    }

    // 8. 2-Minute Advance Alert
    const remainingMinutes = remainingDuration / 60;
    if (settings.alert2Min && remainingMinutes <= 2.2 && remainingMinutes > 0 && !alerts.twoMin && !alerts.reached) {
      alerts.twoMin = true;
      audioEngine.playUrgentAlert();
      if (settings.vibrationEnabled) this.triggerVibration([400, 200, 400, 200, 600]);
      if (settings.notificationsEnabled) {
        this.triggerNotification('Urgent Alert - 2 Minutes Away', t.alert2MinMsg);
      }
      if (settings.voiceEnabled) {
        voiceEngine.speak(t.alert2MinMsg, voiceLang);
      }
      if (settings.napMode && onNapWakeUp) {
        onNapWakeUp();
      }
      onAlert({
        type: '2min',
        title: '2-Minute Alert',
        message: t.alert2MinMsg,
        isUrgent: true
      });
    }
    // 9. 5-Minute Advance Alert
    else if (settings.alert5Min && remainingMinutes <= 5.2 && remainingMinutes > 2.2 && !alerts.fiveMin && !alerts.twoMin) {
      alerts.fiveMin = true;
      audioEngine.playChime();
      if (settings.vibrationEnabled) this.triggerVibration([300, 200, 300]);
      if (settings.notificationsEnabled) {
        this.triggerNotification('Destination Alert - 5 Minutes', t.alert5MinMsg);
      }
      if (settings.voiceEnabled) {
        voiceEngine.speak(t.alert5MinMsg, voiceLang);
      }
      if (settings.napMode && onNapWakeUp) {
        onNapWakeUp();
      }
      onAlert({
        type: '5min',
        title: '5-Minute Alert',
        message: t.alert5MinMsg
      });
    }
    // 10. 10-Minute Advance Alert (Optional)
    else if (settings.alert10Min && remainingMinutes <= 10.2 && remainingMinutes > 5.2 && !alerts.tenMin) {
      alerts.tenMin = true;
      audioEngine.playChime();
      if (settings.notificationsEnabled) {
        this.triggerNotification('Destination Alert - 10 Minutes', t.alert10MinMsg);
      }
      if (settings.voiceEnabled) {
        voiceEngine.speak(t.alert10MinMsg, voiceLang);
      }
      onAlert({
        type: '10min',
        title: '10-Minute Alert',
        message: t.alert10MinMsg
      });
    }

    return {
      updatedJourney: {
        ...journey,
        currentLocation: coords,
        remainingDistance,
        remainingDuration,
        eta,
        progressPercent,
        nextStop,
        stops: updatedStops,
        isOffRoute,
        isDelayed,
        delayMinutes,
        alertsTriggered: alerts
      },
      alertsTriggered: alerts
    };
  }
}

export const alertEngine = new AlertEngine();
