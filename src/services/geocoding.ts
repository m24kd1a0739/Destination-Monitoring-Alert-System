import { LocationPlace } from '../types';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export async function searchPlaces(query: string, userCoords?: { lat: number; lng: number }): Promise<LocationPlace[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  let url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(trimmed)}&limit=6&addressdetails=1`;
  
  // If user coordinates exist, bias results towards user's region
  if (userCoords) {
    const viewbox = `${userCoords.lng - 0.5},${userCoords.lat + 0.5},${userCoords.lng + 0.5},${userCoords.lat - 0.5}`;
    url += `&viewbox=${viewbox}&bounded=0`;
  }

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DestinationMonitorApp/1.0'
      }
    });

    if (!res.ok) {
      throw new Error(`Nominatim error: ${res.status}`);
    }

    const data = await res.json();
    return data.map((item: any) => {
      // Pick cleanest short name
      const name = item.name || item.address?.bus_stop || item.address?.railway || item.address?.amenity || item.address?.road || item.display_name.split(',')[0];
      return {
        id: `osm-${item.place_id || Math.random()}`,
        name: name,
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || item.class
      };
    });
  } catch (error) {
    console.error('Geocoding search error:', error);
    return [];
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<LocationPlace> {
  const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DestinationMonitorApp/1.0'
      }
    });

    if (!res.ok) {
      throw new Error(`Nominatim reverse error: ${res.status}`);
    }

    const item = await res.json();
    const name = item.name || item.address?.bus_stop || item.address?.railway || item.address?.amenity || item.address?.road || item.address?.suburb || 'Current GPS Location';

    return {
      id: `osm-rev-${lat.toFixed(4)}-${lng.toFixed(4)}`,
      name: name,
      displayName: item.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat,
      lng,
      type: item.type || 'gps'
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      id: `gps-${Date.now()}`,
      name: 'Current Location',
      displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat,
      lng,
      type: 'gps'
    };
  }
}
