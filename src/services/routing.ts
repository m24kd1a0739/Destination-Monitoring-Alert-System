import { LocationPlace, RouteOption, RouteStep, StopInfo, TravelMode } from '../types';

const OSRM_PROFILES: Record<TravelMode, string> = {
  walk: 'walking',
  bike: 'bicycle',
  car: 'driving',
  bus: 'driving',
  train: 'driving'
};

// Haversine distance in meters between two lat/lng pairs
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Distance in meters from a point to a line segment
function distanceToSegment(
  pLat: number,
  pLng: number,
  vLat: number,
  vLng: number,
  wLat: number,
  wLng: number
): number {
  const l2 = (vLat - wLat) ** 2 + (vLng - wLng) ** 2;
  if (l2 === 0) return calculateHaversineDistance(pLat, pLng, vLat, vLng);

  let t = ((pLat - vLat) * (wLat - vLat) + (pLng - vLng) * (wLng - vLng)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projLat = vLat + t * (wLat - vLat);
  const projLng = vLng + t * (wLng - vLng);

  return calculateHaversineDistance(pLat, pLng, projLat, projLng);
}

// Calculate minimum cross-track distance in meters to the planned route polyline
export function calculateCrossTrackDistance(
  lat: number,
  lng: number,
  polyline: [number, number][]
): { minDistance: number; closestIndex: number } {
  if (polyline.length === 0) return { minDistance: 0, closestIndex: 0 };
  if (polyline.length === 1) {
    return {
      minDistance: calculateHaversineDistance(lat, lng, polyline[0][0], polyline[0][1]),
      closestIndex: 0
    };
  }

  let minDistance = Infinity;
  let closestIndex = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    const d = distanceToSegment(
      lat,
      lng,
      polyline[i][0],
      polyline[i][1],
      polyline[i + 1][0],
      polyline[i + 1][1]
    );
    if (d < minDistance) {
      minDistance = d;
      closestIndex = i;
    }
  }

  return { minDistance, closestIndex };
}

// Calculate remaining distance in meters along the polyline from user's closest point to destination
export function calculateRemainingPolylineDistance(
  currentLat: number,
  currentLng: number,
  destinationLat: number,
  destinationLng: number,
  polyline: [number, number][]
): number {
  if (polyline.length === 0) {
    return calculateHaversineDistance(currentLat, currentLng, destinationLat, destinationLng);
  }

  const { closestIndex } = calculateCrossTrackDistance(currentLat, currentLng, polyline);
  let distance = 0;

  // Distance from current GPS to the next vertex along the route
  if (closestIndex < polyline.length) {
    distance += calculateHaversineDistance(
      currentLat,
      currentLng,
      polyline[closestIndex + 1]?.[0] || polyline[closestIndex][0],
      polyline[closestIndex + 1]?.[1] || polyline[closestIndex][1]
    );
  }

  // Add all remaining polyline segments
  for (let i = closestIndex + 1; i < polyline.length - 1; i++) {
    distance += calculateHaversineDistance(
      polyline[i][0],
      polyline[i][1],
      polyline[i + 1][0],
      polyline[i + 1][1]
    );
  }

  return Math.round(distance);
}

export async function fetchRealRoutes(
  source: LocationPlace,
  destination: LocationPlace,
  mode: TravelMode
): Promise<RouteOption[]> {
  const profile = OSRM_PROFILES[mode];
  const coordinates = `${source.lng},${source.lat};${destination.lng},${destination.lat}`;
  const url = `https://router.project-osrm.org/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson&steps=true&alternatives=true`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`OSRM routing failed: status ${res.status}`);
    }

    const data = await res.json();
    if (!data.routes || data.routes.length === 0) {
      return [];
    }

    const routes: RouteOption[] = data.routes.map((r: any, idx: number) => {
      // GeoJSON returns [lng, lat] -> convert to Leaflet [lat, lng]
      const polylineCoords: [number, number][] = r.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
      
      const steps: RouteStep[] = [];
      if (r.legs && r.legs[0]?.steps) {
        r.legs[0].steps.forEach((st: any) => {
          const name = st.name || st.maneuver?.type || 'Road';
          steps.push({
            instruction: name,
            distance: st.distance,
            duration: st.duration,
            location: [st.maneuver.location[1], st.maneuver.location[0]]
          });
        });
      }

      // Transit notice if mode is bus or train
      let transitNotice: string | undefined = undefined;
      let adjustedDuration = r.duration;

      if (mode === 'bus') {
        transitNotice = "Public transit timetables unavailable with current routing provider. Road network estimated with typical city transit speed factor (1.25x).";
        adjustedDuration = Math.round(r.duration * 1.25);
      } else if (mode === 'train') {
        transitNotice = "Direct railway network scheduling unavailable with current routing provider. Road-corridor estimate provided.";
        adjustedDuration = Math.round(r.duration * 1.1);
      }

      let routeName: 'Fastest' | 'Shortest' | 'Alternative' = 'Fastest';
      if (idx === 1) routeName = 'Shortest';
      else if (idx > 1) routeName = 'Alternative';

      return {
        id: `route-${idx}-${Math.round(r.distance)}`,
        name: routeName,
        distance: Math.round(r.distance),
        duration: Math.round(adjustedDuration),
        coordinates: polylineCoords,
        steps,
        summary: r.legs?.[0]?.summary || `Route via ${steps[0]?.instruction || 'Main Road'}`,
        transitNotice
      };
    });

    return routes;
  } catch (error) {
    console.error('OSRM route fetch error:', error);
    // Return empty array on failure; no fake fallback routes!
    return [];
  }
}

// Extract real named stops and POIs along the route from step instructions and destination
export function extractStopsFromRoute(route: RouteOption, destination: LocationPlace): StopInfo[] {
  const stops: StopInfo[] = [];
  let accumDistance = 0;

  // Filter meaningful street names and landmarks
  const uniqueNames = new Set<string>();

  route.steps.forEach((step, idx) => {
    accumDistance += step.distance;
    const clean = step.instruction.trim();
    if (
      clean &&
      clean !== 'Road' &&
      clean !== 'depart' &&
      clean !== 'arrive' &&
      !uniqueNames.has(clean) &&
      step.distance > 150 // meaningful segment
    ) {
      uniqueNames.add(clean);
      stops.push({
        id: `stop-${idx}`,
        name: clean,
        lat: step.location[0],
        lng: step.location[1],
        distanceFromStart: Math.round(accumDistance),
        passed: false,
        type: 'waypoint'
      });
    }
  });

  // Always append destination as final stop
  stops.push({
    id: 'dest-stop',
    name: destination.name,
    lat: destination.lat,
    lng: destination.lng,
    distanceFromStart: route.distance,
    passed: false,
    type: 'bus_stop'
  });

  return stops;
}
