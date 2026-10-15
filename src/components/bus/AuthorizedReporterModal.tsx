import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Navigation, 
  Activity, 
  Key, 
  Compass, 
  Power 
} from 'lucide-react';
import { gpsBackendService, RegisteredBusRecord } from '../../services/gpsBackendService';
import { geolocationService } from '../../services/geolocation';

interface AuthorizedReporterModalProps {
  onClose: () => void;
  onUpdateSent?: () => void;
}

export const AuthorizedReporterModal: React.FC<AuthorizedReporterModalProps> = ({
  onClose,
  onUpdateSent
}) => {
  const [buses, setBuses] = useState<RegisteredBusRecord[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>('bus-vzm-pvp-101');
  const [deviceId, setDeviceId] = useState<string>('dev-driver-vzm-1');
  const [deviceToken, setDeviceToken] = useState<string>('dev-token-vzm4512-secure');
  
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number; speed: number | null; accuracy: number | null } | null>(null);
  const [lastServerResponse, setLastServerResponse] = useState<{ success: boolean; message: string; timestamp: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const list = gpsBackendService.listRegisteredBuses();
    setBuses(list);
  }, []);

  const handleSendSingleUpdate = async () => {
    setErrorMsg(null);
    try {
      const pos = await geolocationService.getCurrentPosition();
      setLastCoords({
        lat: pos.lat,
        lng: pos.lng,
        speed: pos.speed || 0,
        accuracy: pos.accuracy || 10
      });

      const res = gpsBackendService.submitGpsUpdate({
        deviceToken,
        deviceId,
        busId: selectedBusId,
        latitude: pos.lat,
        longitude: pos.lng,
        speedKmH: pos.speed ? Math.round(pos.speed * 3.6) : 0,
        accuracyMeters: pos.accuracy,
        timestamp: Date.now()
      });

      setLastServerResponse({
        success: res.success,
        message: res.message,
        timestamp: new Date().toLocaleTimeString()
      });

      if (!res.success) {
        setErrorMsg(res.message);
      } else if (onUpdateSent) {
        onUpdateSent();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to capture real device coordinates. Please ensure GPS is enabled.');
    }
  };

  const handleToggleBroadcast = () => {
    if (isBroadcasting) {
      if (watchIdRef.current !== null) {
        geolocationService.stopWatching();
        watchIdRef.current = null;
      }
      setIsBroadcasting(false);
    } else {
      setErrorMsg(null);
      const wid = geolocationService.startWatching(
        (coords) => {
          setLastCoords({
            lat: coords.lat,
            lng: coords.lng,
            speed: coords.speed || 0,
            accuracy: coords.accuracy || 10
          });

          const res = gpsBackendService.submitGpsUpdate({
            deviceToken,
            deviceId,
            busId: selectedBusId,
            latitude: coords.lat,
            longitude: coords.lng,
            speedKmH: coords.speed ? Math.round(coords.speed * 3.6) : 0,
            accuracyMeters: coords.accuracy,
            timestamp: Date.now()
          });

          setLastServerResponse({
            success: res.success,
            message: res.message,
            timestamp: new Date().toLocaleTimeString()
          });

          if (!res.success) {
            setErrorMsg(res.message);
          } else if (onUpdateSent) {
            onUpdateSent();
          }
        },
        (err) => {
          setErrorMsg(err.message || 'GPS watching error');
          setIsBroadcasting(false);
        }
      );

      if (wid !== null) {
        watchIdRef.current = wid;
        setIsBroadcasting(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        geolocationService.stopWatching();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Authorized GPS Reporter</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Transmitter
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Authorized vehicle transmitter for genuine GPS telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Authorization Notice */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Cryptographic Device Authentication</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Only authorized devices with pre-registered tokens can transmit telemetry for registered fleet buses. Unauthorized coordinates are strictly rejected.
            </p>
          </div>
        </div>

        {/* Bus Selector */}
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Select Assigned Bus
            </label>
            <select
              value={selectedBusId}
              onChange={(e) => {
                setSelectedBusId(e.target.value);
                if (e.target.value === 'bus-vsp-vzm-201') {
                  setDeviceId('dev-driver-vsp-1');
                  setDeviceToken('dev-token-vsp9001-secure');
                } else {
                  setDeviceId('dev-driver-vzm-1');
                  setDeviceToken('dev-token-vzm4512-secure');
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.busNumber} — {b.busName} ({b.routeName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Device Identifier
              </label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Authorization Token
              </label>
              <input
                type="text"
                value={deviceToken}
                onChange={(e) => setDeviceToken(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Status / Telemetry Feedback */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Device GPS:</span>
            <span className="font-mono text-teal-400 font-semibold">
              {lastCoords ? `${lastCoords.lat.toFixed(5)}, ${lastCoords.lng.toFixed(5)}` : 'Awaiting GPS capture'}
            </span>
          </div>
          {lastCoords && (
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Accuracy: ±{Math.round(lastCoords.accuracy || 10)}m</span>
              <span>Speed: {lastCoords.speed ? `${Math.round(lastCoords.speed * 3.6)} km/h` : '0 km/h'}</span>
            </div>
          )}

          {lastServerResponse && (
            <div className={`mt-2 p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
              lastServerResponse.success
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-red-950/40 border-red-500/30 text-red-300'
            }`}>
              {lastServerResponse.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{lastServerResponse.message}</p>
                <p className="text-[10px] opacity-80">Server accepted at: {lastServerResponse.timestamp}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleSendSingleUpdate}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Compass className="w-4 h-4 text-teal-400" />
            <span>Transmit Single Ping</span>
          </button>

          <button
            type="button"
            onClick={handleToggleBroadcast}
            className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
              isBroadcasting
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/30'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isBroadcasting ? 'Stop Live Broadcast' : 'Start Continuous Broadcast'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
