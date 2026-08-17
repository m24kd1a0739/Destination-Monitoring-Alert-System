export type Language = 'en' | 'te' | 'hi' | 'ta' | 'kn';

export type TravelMode = 'walk' | 'bike' | 'car' | 'bus' | 'train';

export type JourneyStatus = 'ready' | 'monitoring' | 'paused' | 'reached' | 'cancelled';

export interface UserProfile {
  name: string;
  phone: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number | null;
  heading?: number | null;
  timestamp?: number;
}

export interface LocationPlace {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
}

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  location: [number, number]; // [lat, lng]
}

export interface RouteOption {
  id: string;
  name: 'Fastest' | 'Shortest' | 'Alternative';
  distance: number; // meters
  duration: number; // seconds
  coordinates: [number, number][]; // [lat, lng]
  steps: RouteStep[];
  summary?: string;
  transitNotice?: string;
}

export interface StopInfo {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceFromStart: number;
  passed: boolean;
  type?: 'bus_stop' | 'station' | 'landmark' | 'waypoint';
}

export interface ActiveJourney {
  id: string;
  source: LocationPlace;
  destination: LocationPlace;
  mode: TravelMode;
  selectedRoute: RouteOption;
  availableRoutes: RouteOption[];
  startTime: number;
  endTime?: number;
  status: JourneyStatus;
  currentLocation: Coordinates | null;
  remainingDistance: number; // meters
  remainingDuration: number; // seconds
  eta: Date;
  initialDuration: number;
  progressPercent: number;
  nextStop: StopInfo | null;
  stops: StopInfo[];
  isOffRoute: boolean;
  isDelayed: boolean;
  delayMinutes: number;
  alertsTriggered: {
    tenMin?: boolean;
    fiveMin?: boolean;
    twoMin?: boolean;
    reached?: boolean;
    offRoute?: boolean;
    delay?: boolean;
  };
}

export interface JourneyHistoryRecord {
  id: string;
  sourceName: string;
  sourceCoords: [number, number];
  destinationName: string;
  destinationCoords: [number, number];
  mode: TravelMode;
  date: string;
  startTime: string;
  endTime: string;
  durationFormatted: string;
  distanceFormatted: string;
  status: 'Completed' | 'Cancelled';
}

export interface FavouriteRoute {
  id: string;
  title: string;
  source: LocationPlace;
  destination: LocationPlace;
  mode: TravelMode;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  priority: 1 | 2 | 3;
}

export interface AlertSettings {
  alert10Min: boolean;
  alert5Min: boolean;
  alert2Min: boolean;
  vibrationEnabled: boolean;
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
  napMode: boolean;
  arrivalRadiusMeters: number;
  offRouteThresholdMeters: number;
}
