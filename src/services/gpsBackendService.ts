/**
 * GPS BACKEND SERVICE & API CONTRACT
 * ==================================
 * Implements authorized device authentication, GPS coordinate validation,
 * persistence, and truthful location freshness calculations (LIVE, STALE, DATA_UNAVAILABLE, BUS_NOT_FOUND).
 */

export type LocationFreshnessStatus = 'LIVE' | 'STALE' | 'DATA_UNAVAILABLE' | 'BUS_NOT_FOUND' | 'ERROR';

export interface VerifiedVehicleLocation {
  id: string;
  busId: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  speedKmH: number;
  heading: number;
  accuracyMeters?: number;
  deviceTimestamp: string;
  serverTimestamp: string;
  dataSource: 'authorized_device' | 'gtfs_rt' | 'iot_tracker';
  isValid: boolean;
  ageSeconds: number;
}

export interface BusLocationResponse {
  status: LocationFreshnessStatus;
  busId: string;
  busNumber?: string;
  busName?: string;
  routeName?: string;
  location: VerifiedVehicleLocation | null;
  message: string;
  freshnessThresholdSeconds: number;
}

export interface RegisteredBusRecord {
  id: string;
  busNumber: string;
  busName: string;
  busType: string;
  operator: string;
  routeId: string;
  routeName: string;
  source: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  isActive: boolean;
  createdAt: string;
}

export interface AuthorizedDeviceRecord {
  deviceId: string;
  busId: string;
  deviceLabel: string;
  tokenHash: string; // Pre-shared device token identifier
  status: 'active' | 'revoked';
  createdAt: string;
  lastReportedAt?: string;
}

// Configurable Freshness Threshold (default: 45 seconds for urban transit tracking)
export const FRESHNESS_THRESHOLD_SECONDS = 45;

// Local persistence keys
const STORAGE_BUSES_KEY = 'dm_backend_registered_buses_v1';
const STORAGE_DEVICES_KEY = 'dm_backend_authorized_devices_v1';
const STORAGE_LOCATIONS_KEY = 'dm_backend_vehicle_locations_v1';

// Initial Registered Fleet
const DEFAULT_REGISTERED_BUSES: RegisteredBusRecord[] = [
  {
    id: 'bus-vzm-pvp-101',
    busNumber: 'AP 35 Z 4512',
    busName: 'APSRTC Super Luxury',
    busType: 'Super Luxury',
    operator: 'APSRTC',
    routeId: 'route-vzm-pvp',
    routeName: 'Vizianagaram → Parvathipuram',
    source: { name: 'Vizianagaram RTC Complex', lat: 18.1124, lng: 83.4070 },
    destination: { name: 'Parvathipuram RTC Complex', lat: 18.7788, lng: 83.4285 },
    isActive: true,
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'bus-vsp-vzm-201',
    busNumber: 'AP 31 Z 9001',
    busName: 'APSRTC Garuda Plus (AC)',
    busType: 'Garuda Plus',
    operator: 'APSRTC',
    routeId: 'route-vsp-vzm',
    routeName: 'Visakhapatnam → Vizianagaram',
    source: { name: 'Dwaraka Bus Station (Vizag)', lat: 17.7275, lng: 83.3032 },
    destination: { name: 'Vizianagaram RTC Complex', lat: 18.1124, lng: 83.4070 },
    isActive: true,
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'bus-bza-gnt-301',
    busNumber: 'AP 16 Z 7788',
    busName: 'APSRTC Non-Stop Super Luxury',
    busType: 'Super Luxury',
    operator: 'APSRTC',
    routeId: 'route-bza-gnt',
    routeName: 'Vijayawada → Guntur',
    source: { name: 'PNBS Vijayawada', lat: 16.5097, lng: 80.6175 },
    destination: { name: 'Guntur NTR Bus Station', lat: 16.3067, lng: 80.4365 },
    isActive: true,
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'bus-hyd-bza-401',
    busNumber: 'TS 09 Z 4455',
    busName: 'TSRTC Garuda Plus AC',
    busType: 'Garuda Plus',
    operator: 'TSRTC',
    routeId: 'route-hyd-bza',
    routeName: 'Hyderabad (MGBS) → Vijayawada (PNBS)',
    source: { name: 'MGBS Hyderabad', lat: 17.3786, lng: 78.4816 },
    destination: { name: 'PNBS Vijayawada', lat: 16.5097, lng: 80.6175 },
    isActive: true,
    createdAt: '2026-08-01T00:00:00.000Z'
  }
];

// Pre-authorized demonstration hardware tokens for authorized drivers
const DEFAULT_AUTHORIZED_DEVICES: AuthorizedDeviceRecord[] = [
  {
    deviceId: 'dev-driver-vzm-1',
    busId: 'bus-vzm-pvp-101',
    deviceLabel: 'Driver Unit #1 (Vizianagaram)',
    tokenHash: 'dev-token-vzm4512-secure',
    status: 'active',
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    deviceId: 'dev-driver-vsp-1',
    busId: 'bus-vsp-vzm-201',
    deviceLabel: 'Driver Unit #2 (Visakhapatnam)',
    tokenHash: 'dev-token-vsp9001-secure',
    status: 'active',
    createdAt: '2026-08-01T00:00:00.000Z'
  }
];

class GpsBackendService {
  private memoryBuses: RegisteredBusRecord[] = [...DEFAULT_REGISTERED_BUSES];
  private memoryDevices: AuthorizedDeviceRecord[] = [...DEFAULT_AUTHORIZED_DEVICES];
  private memoryLocations: Record<string, VerifiedVehicleLocation> = {};

  private getBuses(): RegisteredBusRecord[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_BUSES_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch {}
    return this.memoryBuses;
  }

  private saveBuses(buses: RegisteredBusRecord[]): void {
    this.memoryBuses = buses;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_BUSES_KEY, JSON.stringify(buses));
      }
    } catch {}
  }

  private getDevices(): AuthorizedDeviceRecord[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_DEVICES_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch {}
    return this.memoryDevices;
  }

  private saveDevices(devices: AuthorizedDeviceRecord[]): void {
    this.memoryDevices = devices;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_DEVICES_KEY, JSON.stringify(devices));
      }
    } catch {}
  }

  private getLocations(): Record<string, VerifiedVehicleLocation> {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_LOCATIONS_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch {}
    return this.memoryLocations;
  }

  private saveLocations(locations: Record<string, VerifiedVehicleLocation>): void {
    this.memoryLocations = locations;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_LOCATIONS_KEY, JSON.stringify(locations));
      }
    } catch {}
  }

  /**
   * Return all currently registered and active buses in the system.
   */
  public listRegisteredBuses(): RegisteredBusRecord[] {
    return this.getBuses().filter((b) => b.isActive);
  }

  /**
   * Search for a registered bus by internal ID or registration plate.
   */
  public findBus(query: string): RegisteredBusRecord | null {
    const clean = query.trim().toUpperCase().replace(/\s+/g, '');
    if (!clean) return null;

    const buses = this.getBuses();
    return (
      buses.find(
        (b) =>
          b.id.toUpperCase() === clean ||
          b.busNumber.replace(/\s+/g, '').toUpperCase() === clean ||
          b.busNumber.replace(/\s+/g, '').toUpperCase().includes(clean)
      ) || null
    );
  }

  /**
   * Authenticate and ingest GPS updates from an authorized tracking device.
   * Rejects unauthorized devices, invalid coordinates, and implausible timestamps.
   */
  public submitGpsUpdate(submission: {
    deviceToken: string;
    deviceId: string;
    busId: string;
    latitude: number;
    longitude: number;
    speedKmH?: number;
    heading?: number;
    accuracyMeters?: number;
    timestamp?: string | number;
  }): { success: boolean; message: string; location?: VerifiedVehicleLocation } {
    const { deviceToken, deviceId, busId, latitude, longitude, speedKmH, heading, accuracyMeters, timestamp } = submission;

    // 1. Verify Bus Exists
    const buses = this.getBuses();
    const targetBus = buses.find((b) => b.id === busId);
    if (!targetBus) {
      return { success: false, message: `Bus identifier '${busId}' is not registered in the system.` };
    }

    // 2. Authenticate Device and verify device-to-bus association
    const devices = this.getDevices();
    const authorizedDevice = devices.find(
      (d) => d.deviceId === deviceId && d.busId === busId && d.status === 'active'
    );

    if (!authorizedDevice) {
      return {
        success: false,
        message: `Device '${deviceId}' is not authorized to submit telemetry for bus '${busId}'.`
      };
    }

    if (authorizedDevice.tokenHash !== deviceToken.trim()) {
      return {
        success: false,
        message: 'Invalid device authorization token. Access denied.'
      };
    }

    // 3. Validate Coordinates
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return {
        success: false,
        message: `Invalid geographical coordinates [lat: ${latitude}, lng: ${longitude}].`
      };
    }

    // 4. Validate Timestamp
    const deviceTimeMs = timestamp ? new Date(timestamp).getTime() : Date.now();
    const nowMs = Date.now();
    if (isNaN(deviceTimeMs)) {
      return { success: false, message: 'Malformed timestamp format.' };
    }

    // Reject timestamps more than 15 minutes into future or older than 24 hours
    if (deviceTimeMs > nowMs + 15 * 60 * 1000) {
      return { success: false, message: 'Timestamp is in the future. Rejected.' };
    }
    if (deviceTimeMs < nowMs - 24 * 60 * 60 * 1000) {
      return { success: false, message: 'Timestamp is older than 24 hours. Stale update rejected.' };
    }

    // 5. Build Validated Location Record
    const verifiedLocation: VerifiedVehicleLocation = {
      id: `loc-${busId}-${Date.now()}`,
      busId,
      deviceId,
      latitude,
      longitude,
      speedKmH: Math.max(0, Math.min(200, Math.round(speedKmH || 0))),
      heading: Math.max(0, Math.min(360, Math.round(heading || 0))),
      accuracyMeters: accuracyMeters ? Math.round(accuracyMeters) : undefined,
      deviceTimestamp: new Date(deviceTimeMs).toISOString(),
      serverTimestamp: new Date(nowMs).toISOString(),
      dataSource: 'authorized_device',
      isValid: true,
      ageSeconds: 0
    };

    // Store latest vehicle location
    const locations = this.getLocations();
    locations[busId] = verifiedLocation;
    this.saveLocations(locations);

    // Update last reported timestamp on device
    const updatedDevices = devices.map((d) =>
      d.deviceId === deviceId ? { ...d, lastReportedAt: verifiedLocation.serverTimestamp } : d
    );
    this.saveDevices(updatedDevices);

    return {
      success: true,
      message: `GPS telemetry accepted for bus ${targetBus.busNumber}.`,
      location: verifiedLocation
    };
  }

  /**
   * Look up latest verified location for a bus and calculate truthful freshness state.
   */
  public getBusLocation(busIdOrNumber: string): BusLocationResponse {
    const bus = this.findBus(busIdOrNumber);
    if (!bus) {
      return {
        status: 'BUS_NOT_FOUND',
        busId: busIdOrNumber,
        location: null,
        message: `Bus '${busIdOrNumber}' is not registered in the transit database.`,
        freshnessThresholdSeconds: FRESHNESS_THRESHOLD_SECONDS
      };
    }

    const locations = this.getLocations();
    const record = locations[bus.id];

    if (!record) {
      return {
        status: 'DATA_UNAVAILABLE',
        busId: bus.id,
        busNumber: bus.busNumber,
        busName: bus.busName,
        routeName: bus.routeName,
        location: null,
        message: `No verified GPS updates have been received yet for bus ${bus.busNumber}.`,
        freshnessThresholdSeconds: FRESHNESS_THRESHOLD_SECONDS
      };
    }

    const nowMs = Date.now();
    const serverTimeMs = new Date(record.serverTimestamp).getTime();
    const ageSeconds = Math.max(0, Math.round((nowMs - serverTimeMs) / 1000));

    const status: LocationFreshnessStatus =
      ageSeconds <= FRESHNESS_THRESHOLD_SECONDS ? 'LIVE' : 'STALE';

    const locationWithAge: VerifiedVehicleLocation = {
      ...record,
      ageSeconds
    };

    const message =
      status === 'LIVE'
        ? `Live GPS signal active (${ageSeconds}s ago).`
        : `GPS telemetry is stale. Last update was received ${ageSeconds}s ago (threshold: ${FRESHNESS_THRESHOLD_SECONDS}s).`;

    return {
      status,
      busId: bus.id,
      busNumber: bus.busNumber,
      busName: bus.busName,
      routeName: bus.routeName,
      location: locationWithAge,
      message,
      freshnessThresholdSeconds: FRESHNESS_THRESHOLD_SECONDS
    };
  }

  /**
   * Get authorized devices list (for administrative setup or driver selection)
   */
  public listAuthorizedDevices(): AuthorizedDeviceRecord[] {
    return this.getDevices();
  }
}

export const gpsBackendService = new GpsBackendService();
