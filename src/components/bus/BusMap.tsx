import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BusInfo, BusStop } from '../../types';

interface BusMapProps {
  bus: BusInfo;
  selectedStopId?: string | null;
  className?: string;
}

export const BusMap: React.FC<BusMapProps> = ({
  bus,
  selectedStopId,
  className = 'h-[360px] sm:h-[460px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);

  // 1. Initialize Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = bus.currentLocation.lat || bus.source.lat;
    const initialLng = bus.currentLocation.lng || bus.source.lng;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
      zoomControl: true,
      attributionControl: false
    });

    // Clean transport CartoDB voyager tiles matching app aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Update Map Elements on bus changes
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

    // Helper: Custom circular HTML marker
    const createCustomIcon = (
      bgColor: string,
      borderColor: string,
      innerHtml: string,
      size = 28,
      boxShadow = '0 4px 12px rgba(0,0,0,0.5)'
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
            box-shadow: ${boxShadow};
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

    // A. Source Marker (Green)
    if (bus.source) {
      const sourceIcon = createCustomIcon('#10B981', '#ffffff', 'A', 26);
      const m = L.marker([bus.source.lat, bus.source.lng], { icon: sourceIcon })
        .bindPopup(`<b>Start:</b> ${bus.source.name}`);
      markersGroup.addLayer(m);
      boundsPoints.push([bus.source.lat, bus.source.lng]);
    }

    // B. Destination Marker (Red)
    if (bus.destination) {
      const destIcon = createCustomIcon('#EF4444', '#ffffff', 'B', 30);
      const m = L.marker([bus.destination.lat, bus.destination.lng], { icon: destIcon })
        .bindPopup(`<b>Destination:</b> ${bus.destination.name}`);
      markersGroup.addLayer(m);
      boundsPoints.push([bus.destination.lat, bus.destination.lng]);
    }

    // C. Intermediate Bus Stops
    bus.stops.forEach((stop, idx) => {
      const isMyStop = selectedStopId === stop.id;
      const isNext = bus.nextStop?.id === stop.id;
      const isPassed = stop.passed;

      let color = isPassed ? '#059669' : isNext ? '#0284C7' : '#64748B';
      let borderColor = '#ffffff';
      let size = 20;

      if (isMyStop) {
        color = '#F59E0B'; // Gold / Amber for user's selected stop
        borderColor = '#FEF08A';
        size = 28;
      }

      const stopIcon = createCustomIcon(
        color, 
        borderColor, 
        isMyStop ? '⭐' : `${idx + 1}`, 
        size,
        isMyStop ? '0 0 16px rgba(245, 158, 11, 0.8)' : '0 2px 8px rgba(0,0,0,0.4)'
      );

      const m = L.marker([stop.lat, stop.lng], { icon: stopIcon, zIndexOffset: isMyStop ? 500 : 100 })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <b style="color: #0284c7;">Stop ${idx + 1}: ${stop.name}</b><br/>
            ${isMyStop ? '<span style="color: #d97706; font-weight: bold;">⭐ Selected as My Stop</span><br/>' : ''}
            <span>Status: ${isPassed ? 'Passed' : isNext ? 'Upcoming Next' : 'En-route'}</span><br/>
            <span>ETA: ~${stop.etaMinutes} min</span>
          </div>
        `);
      markersGroup.addLayer(m);
      boundsPoints.push([stop.lat, stop.lng]);
    });

    // D. Current Live Bus Marker (with pulsing halo + Bus icon)
    if (bus.currentLocation) {
      const busMarkerIcon = L.divIcon({
        className: 'bus-live-map-marker',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: rgba(14, 165, 233, 0.4);
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
              z-index: 1;
            "></div>
            <div style="
              position: relative;
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, #0ea5e9, #0284c7);
              border: 2.5px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 0 18px rgba(14, 165, 233, 0.9);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 16px;
              z-index: 2;
            ">
              🚌
            </div>
            <div style="
              position: absolute;
              bottom: -18px;
              background: #0B0F19;
              color: #38bdf8;
              font-size: 9px;
              font-weight: 800;
              padding: 1px 6px;
              border-radius: 6px;
              border: 1px solid #0284c7;
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.8);
              z-index: 3;
            ">
              ${bus.busNumber.split(' ').slice(-2).join(' ')}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const busMarker = L.marker([bus.currentLocation.lat, bus.currentLocation.lng], {
        icon: busMarkerIcon,
        zIndexOffset: 2000
      }).bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <b style="color: #0284c7; font-size: 13px;">${bus.busNumber}</b><br/>
          <span>${bus.busName}</span><br/>
          <b>Location:</b> ${bus.currentLocation.name}<br/>
          <b>Next Stop:</b> ${bus.nextStop.name}<br/>
          <b>Speed:</b> ${bus.speedKmH} km/h<br/>
          <b>ETA:</b> ${bus.expectedArrivalTime}
        </div>
      `);
      markersGroup.addLayer(busMarker);
      boundsPoints.push([bus.currentLocation.lat, bus.currentLocation.lng]);
    }

    // E. Draw Full Route Polyline
    if (bus.polylineCoordinates && bus.polylineCoordinates.length > 0) {
      const polyline = L.polyline(bus.polylineCoordinates, {
        color: '#0284C7',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      polylineLayerRef.current = polyline;

      // Fit bounds to polyline
      map.fitBounds(polyline.getBounds(), { padding: [40, 40], maxZoom: 15 });
    } else if (boundsPoints.length > 1) {
      map.fitBounds(L.latLngBounds(boundsPoints), { padding: [50, 50], maxZoom: 14 });
    }
  }, [bus, selectedStopId]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-dark-border shadow-2xl bg-dark-surface">
      <div ref={mapContainerRef} className={`w-full ${className} z-10`} />

      {/* Map Overlay Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2 pointer-events-none">
        <div className="bg-dark-bg/90 backdrop-blur-md border border-brand-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-300 flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Live Telemetry • {bus.speedKmH} km/h</span>
        </div>

        {selectedStopId && (
          <div className="bg-amber-500/20 backdrop-blur-md border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow-lg">
            <span>⭐ My Stop Alert Active</span>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-dark-bg/90 backdrop-blur-md border border-dark-border px-3 py-2 rounded-xl text-[10px] text-slate-300 flex flex-wrap items-center gap-3 shadow-lg pointer-events-none">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
          <span>Start</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 rounded-full bg-brand-500 text-[8px] text-white flex items-center justify-center font-bold">🚌</span>
          <span>Bus</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white"></span>
          <span>My Stop</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white"></span>
          <span>Dest</span>
        </div>
      </div>
    </div>
  );
};
