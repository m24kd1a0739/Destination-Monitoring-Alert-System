import { LocationPlace } from './index';

export type BusType = 'Super Luxury' | 'Express' | 'Ultra Deluxe' | 'Garuda Plus' | 'Palle Velugu' | 'City Ordinary';

export type BusStatus = 'on_time' | 'delayed' | 'approaching' | 'arrived';

export interface BusStop {
  id: string;
  name: string;
  nameTranslations?: Record<string, string>;
  lat: number;
  lng: number;
  distanceFromStartKm: number;
  etaMinutes: number;
  passed: boolean;
  isMyStop?: boolean;
}

export interface BusInfo {
  id: string;
  busNumber: string; // e.g. "AP 35 Z 4512"
  busName: string; // e.g. "APSRTC Super Luxury"
  busType: BusType;
  operator: string; // e.g. "APSRTC"
  routeId: string;
  routeName: string; // e.g. "Vizianagaram → Parvathipuram"
  source: LocationPlace;
  destination: LocationPlace;
  stops: BusStop[];
  currentStopIndex: number;
  currentLocation: {
    name: string;
    lat: number;
    lng: number;
  };
  nextStop: BusStop;
  expectedArrivalTime: string; // e.g. "07:45 PM"
  estimatedJourneyDuration: string; // e.g. "1 hr 45 min"
  distanceRemainingKm: number;
  delayMinutes: number;
  status: BusStatus;
  speedKmH: number;
  polylineCoordinates: [number, number][]; // [lat, lng]
  lastUpdated: string;
  isSimulating?: boolean;
}

export interface BusSearchFilter {
  from: string;
  to: string;
  busNumber?: string;
}
