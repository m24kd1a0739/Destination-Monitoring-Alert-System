import L from 'leaflet';

export interface MapTileConfig {
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string | string[];
}

// Map tile providers with legal attribution and reliable fallback hierarchy
export const PRIMARY_TILE_CONFIG: MapTileConfig = {
  url: (import.meta as any).env?.VITE_MAP_TILE_URL || 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
  maxZoom: 19,
  subdomains: 'abcd'
};

export const FALLBACK_TILE_CONFIG: MapTileConfig = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  maxZoom: 19
};

/**
 * Attaches a resilient TileLayer to a Leaflet map with automatic fallback on network/tile error.
 */
export function setupResilientTileLayer(
  map: L.Map,
  onTileError?: (errorCount: number) => void
): { primaryLayer: L.TileLayer; remove: () => void } {
  let failedTiles = 0;
  let fallbackActive = false;
  let fallbackLayer: L.TileLayer | null = null;

  const primaryLayer = L.tileLayer(PRIMARY_TILE_CONFIG.url, {
    attribution: PRIMARY_TILE_CONFIG.attribution,
    maxZoom: PRIMARY_TILE_CONFIG.maxZoom,
    subdomains: PRIMARY_TILE_CONFIG.subdomains || 'abc'
  });

  primaryLayer.on('tileerror', () => {
    failedTiles++;
    if (onTileError) {
      onTileError(failedTiles);
    }

    // If multiple tiles fail (e.g. rate limit, 403, or invalid token on primary), switch to fallback OSM
    if (failedTiles >= 3 && !fallbackActive) {
      fallbackActive = true;
      try {
        fallbackLayer = L.tileLayer(FALLBACK_TILE_CONFIG.url, {
          attribution: FALLBACK_TILE_CONFIG.attribution,
          maxZoom: FALLBACK_TILE_CONFIG.maxZoom
        }).addTo(map);
        console.warn('Map notice: Primary tile provider failed; switched to OpenStreetMap fallback.');
      } catch (err) {
        console.error('Failed to attach fallback tile layer:', err);
      }
    }
  });

  primaryLayer.addTo(map);

  return {
    primaryLayer,
    remove: () => {
      primaryLayer.remove();
      if (fallbackLayer) {
        fallbackLayer.remove();
      }
    }
  };
}
