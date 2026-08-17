import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Coordinates, LocationPlace, RouteOption, StopInfo } from '../../types';

interface LiveMapProps {
  currentGPS: Coordinates | null;
  source: LocationPlace | null;
  destination: LocationPlace | null;
  selectedRoute: RouteOption | null;
  stops?: StopInfo[];
  nextStop?: StopInfo | null;
  onSelectMapLocation?: (lat: number, lng: number) => void;
  className?: string;
  isInteractivePicker?: boolean;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  currentGPS,
  source,
  destination,
  selectedRoute,
  stops = [],
  nextStop,
  onSelectMapLocation,
  className = 'h-[360px] sm:h-[450px]',
  isInteractivePicker = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center (India center if no coords)
    const initialLat = currentGPS?.lat || source?.lat || destination?.lat || 20.5937;
    const initialLng = currentGPS?.lng || source?.lng || destination?.lng || 78.9629;
    const initialZoom = currentGPS || source || destination ? 13 : 5;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: false
    });

    // Dark styled CartoDB tile layer for modern transportation UI
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Map click event for location picker mode
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onSelectMapLocation) {
        onSelectMapLocation(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers, Polyline, and Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (polylineLayerRef.current) {
      polylineLayerRef.current.remove();
      polylineLayerRef.current = null;
    }

    const boundsPoints: [number, number][] = [];

    // Helper: Create custom HTML div icon
    const createCustomIcon = (
      bgColor: string,
      borderColor: string,
      innerHtml: string,
      size = 28
    ) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background: ${bgColor};
            border: 2.5px solid ${borderColor};
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
          ">
            ${innerHtml}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });
    };

    // 1. Source Marker (Green / Start)
    if (source) {
      const sourceIcon = createCustomIcon('#10B981', '#ffffff', 'A', 26);
      const m = L.marker([source.lat, source.lng], { icon: sourceIcon })
        .bindPopup(`<b>Start:</b> ${source.name}`);
      markersGroup.addLayer(m);
      boundsPoints.push([source.lat, source.lng]);
    }

    // 2. Destination Marker (Red / End)
    if (destination) {
      const destIcon = createCustomIcon('#EF4444', '#ffffff', 'B', 30);
      const m = L.marker([destination.lat, destination.lng], { icon: destIcon })
        .bindPopup(`<b>Destination:</b> ${destination.name}`);
      markersGroup.addLayer(m);
      boundsPoints.push([destination.lat, destination.lng]);
    }

    // 3. Named Stops along Route (Green if passed, Blue if next)
    stops.forEach((stop, idx) => {
      const isNext = nextStop?.id === stop.id;
      const color = stop.passed ? '#059669' : isNext ? '#0284C7' : '#64748B';
      const stopIcon = createCustomIcon(color, '#ffffff', `${idx + 1}`, isNext ? 24 : 18);
      const m = L.marker([stop.lat, stop.lng], { icon: stopIcon })
        .bindPopup(`<b>Stop ${idx + 1}:</b> ${stop.name} ${isNext ? '(Upcoming)' : ''}`);
      markersGroup.addLayer(m);
    });

    // 4. Current GPS Location (Blue with pulsing ring)
    if (currentGPS) {
      const gpsIcon = L.divIcon({
        className: 'gps-live-marker',
        html: `
          <div style="position: relative; width: 22px; height: 22px;">
            <div style="
              position: absolute;
              width: 100%;
              height: 100%;
              background: #0284C7;
              border: 3px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 0 14px rgba(2, 132, 199, 0.9);
              z-index: 2;
            "></div>
            <div style="
              position: absolute;
              top: -6px;
              left: -6px;
              width: 34px;
              height: 34px;
              border-radius: 50%;
              background: rgba(2, 132, 199, 0.35);
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
              z-index: 1;
            "></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const m = L.marker([currentGPS.lat, currentGPS.lng], { icon: gpsIcon, zIndexOffset: 1000 })
        .bindPopup(`<b>Live Location</b><br/>Accuracy: ±${Math.round(currentGPS.accuracy || 10)}m`);
      markersGroup.addLayer(m);
      boundsPoints.push([currentGPS.lat, currentGPS.lng]);
    }

    // 5. Draw Polyline
    if (selectedRoute && selectedRoute.coordinates.length > 0) {
      const polyline = L.polyline(selectedRoute.coordinates, {
        color: '#0284C7',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      polylineLayerRef.current = polyline;

      // Fit bounds to polyline
      map.fitBounds(polyline.getBounds(), { padding: [40, 40], maxZoom: 16 });
    } else if (boundsPoints.length > 1) {
      map.fitBounds(L.latLngBounds(boundsPoints), { padding: [50, 50], maxZoom: 15 });
    } else if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 14);
    }
  }, [currentGPS, source, destination, selectedRoute, stops, nextStop]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-dark-border shadow-2xl bg-dark-surface">
      <div ref={mapContainerRef} className={`w-full ${className} z-10`} />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-dark-bg/85 backdrop-blur-md border border-dark-border px-3 py-2 rounded-xl text-[10px] text-slate-300 flex items-center space-x-3 shadow-lg pointer-events-none">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
          <span>Start</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white"></span>
          <span>GPS</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white"></span>
          <span>Dest</span>
        </div>
      </div>

      {/* Interactive Picker Hint */}
      {isInteractivePicker && (
        <div className="absolute top-3 left-3 right-3 z-20 bg-brand-600/90 backdrop-blur-md text-white text-xs font-semibold py-1.5 px-3 rounded-xl text-center shadow-lg pointer-events-none">
          Tap anywhere on map to select location
        </div>
      )}
    </div>
  );
};
