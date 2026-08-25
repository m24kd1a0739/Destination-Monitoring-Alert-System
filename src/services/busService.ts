import { BusInfo, BusSearchFilter, BusStop, LocationPlace } from '../types';
import { calculateHaversineDistance } from './routing';

/**
 * PRODUCTION INTEGRATION NOTE:
 * ----------------------------
 * This service currently manages realistic live simulation telemetry for prototype demonstration.
 * To integrate with real-time transit telemetry (e.g., State Transport GTFS-RT, APSRTC/TSRTC live GPS feed,
 * AIS-140 Vahan GPS Tracker, or OpenTripPlanner), replace the demo provider functions with HTTP/WebSocket calls
 * to your backend server in `fetchLiveBusesFromAPI()` below.
 */

// Generate intermediate polyline points between coordinates for smooth simulation
function generatePolyline(points: [number, number][], stepsPerSegment = 8): [number, number][] {
  const result: [number, number][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [lat1, lng1] = points[i];
    const [lat2, lng2] = points[i + 1];
    for (let s = 0; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      result.push([
        lat1 + (lat2 - lat1) * t,
        lng1 + (lng2 - lng1) * t
      ]);
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

// Route 1: Vizianagaram -> Parvathipuram
const VZM_PVP_KEYPOINTS: [number, number][] = [
  [18.1124, 83.4070], // Vizianagaram RTC Complex
  [18.1450, 83.3980], // VZM Bypass / Phool Bagh
  [18.2100, 83.3650], // Bondapalli
  [18.2831, 83.3328], // Gajapathinagaram
  [18.4200, 83.3480], // Ramabhadrapuram
  [18.5724, 83.3644], // Bobbili
  [18.5284, 83.2120], // Salur
  [18.6600, 83.3300], // Seethanagaram
  [18.7788, 83.4285]  // Parvathipuram RTC Complex
];

const VZM_PVP_POLYLINE = generatePolyline(VZM_PVP_KEYPOINTS, 10);

const VZM_PVP_STOPS: BusStop[] = [
  { id: 'stop-vzm-1', name: 'Vizianagaram RTC Complex', lat: 18.1124, lng: 83.4070, distanceFromStartKm: 0, etaMinutes: 0, passed: true },
  { id: 'stop-vzm-2', name: 'Gajapathinagaram', lat: 18.2831, lng: 83.3328, distanceFromStartKm: 24.5, etaMinutes: 35, passed: false },
  { id: 'stop-vzm-3', name: 'Bobbili', lat: 18.5724, lng: 83.3644, distanceFromStartKm: 58.2, etaMinutes: 75, passed: false },
  { id: 'stop-vzm-4', name: 'Salur', lat: 18.5284, lng: 83.2120, distanceFromStartKm: 76.8, etaMinutes: 105, passed: false },
  { id: 'stop-vzm-5', name: 'Parvathipuram', lat: 18.7788, lng: 83.4285, distanceFromStartKm: 98.4, etaMinutes: 135, passed: false }
];

// Route 2: Visakhapatnam -> Vizianagaram
const VSP_VZM_KEYPOINTS: [number, number][] = [
  [17.7275, 83.3032], // RTC Complex Vizag
  [17.7408, 83.3325], // Maddilapalem
  [17.7780, 83.3600], // PM Palem / Cricket Stadium
  [17.8920, 83.3986], // Anandapuram Junction
  [17.9358, 83.4475], // Tagarapuvalasa
  [18.0400, 83.4150], // Denkada
  [18.1124, 83.4070]  // Vizianagaram RTC Complex
];

const VSP_VZM_POLYLINE = generatePolyline(VSP_VZM_KEYPOINTS, 10);

const VSP_VZM_STOPS: BusStop[] = [
  { id: 'stop-vsp-1', name: 'Dwaraka Bus Station (Vizag)', lat: 17.7275, lng: 83.3032, distanceFromStartKm: 0, etaMinutes: 0, passed: true },
  { id: 'stop-vsp-2', name: 'Maddilapalem', lat: 17.7408, lng: 83.3325, distanceFromStartKm: 4.8, etaMinutes: 12, passed: true },
  { id: 'stop-vsp-3', name: 'Anandapuram', lat: 17.8920, lng: 83.3986, distanceFromStartKm: 26.3, etaMinutes: 42, passed: false },
  { id: 'stop-vsp-4', name: 'Tagarapuvalasa', lat: 17.9358, lng: 83.4475, distanceFromStartKm: 35.1, etaMinutes: 55, passed: false },
  { id: 'stop-vsp-5', name: 'Vizianagaram', lat: 18.1124, lng: 83.4070, distanceFromStartKm: 56.7, etaMinutes: 85, passed: false }
];

// Route 3: Vijayawada -> Guntur
const BZA_GNT_KEYPOINTS: [number, number][] = [
  [16.5097, 80.6175], // PNBS Vijayawada
  [16.4950, 80.6210], // Varadhi
  [16.4380, 80.5620], // Mangalagiri Bypass
  [16.3765, 80.5280], // Nagarjuna University
  [16.3067, 80.4365]  // Guntur NTR Bus Station
];

const BZA_GNT_POLYLINE = generatePolyline(BZA_GNT_KEYPOINTS, 10);

const BZA_GNT_STOPS: BusStop[] = [
  { id: 'stop-bza-1', name: 'PNBS Vijayawada', lat: 16.5097, lng: 80.6175, distanceFromStartKm: 0, etaMinutes: 0, passed: true },
  { id: 'stop-bza-2', name: 'Kanaka Durga Varadhi', lat: 16.4950, lng: 80.6210, distanceFromStartKm: 3.5, etaMinutes: 8, passed: true },
  { id: 'stop-bza-3', name: 'Mangalagiri Bypass', lat: 16.4380, lng: 80.5620, distanceFromStartKm: 14.2, etaMinutes: 25, passed: false },
  { id: 'stop-bza-4', name: 'Nagarjuna University', lat: 16.3765, lng: 80.5280, distanceFromStartKm: 23.8, etaMinutes: 38, passed: false },
  { id: 'stop-bza-5', name: 'Guntur NTR Bus Station', lat: 16.3067, lng: 80.4365, distanceFromStartKm: 36.4, etaMinutes: 55, passed: false }
];

// Route 4: Hyderabad -> Vijayawada
const HYD_BZA_KEYPOINTS: [number, number][] = [
  [17.3786, 78.4816], // MGBS Hyderabad
  [17.3486, 78.5528], // LB Nagar
  [17.2476, 78.9056], // Choutuppal
  [17.1439, 79.6239], // Suryapet
  [16.9972, 79.9678], // Kodad
  [16.7725, 80.2922], // Nandigama
  [16.5097, 80.6175]  // PNBS Vijayawada
];

const HYD_BZA_POLYLINE = generatePolyline(HYD_BZA_KEYPOINTS, 10);

const HYD_BZA_STOPS: BusStop[] = [
  { id: 'stop-hyd-1', name: 'MGBS Hyderabad', lat: 17.3786, lng: 78.4816, distanceFromStartKm: 0, etaMinutes: 0, passed: true },
  { id: 'stop-hyd-2', name: 'LB Nagar', lat: 17.3486, lng: 78.5528, distanceFromStartKm: 12.5, etaMinutes: 25, passed: true },
  { id: 'stop-hyd-3', name: 'Suryapet', lat: 17.1439, lng: 79.6239, distanceFromStartKm: 135.0, etaMinutes: 140, passed: false },
  { id: 'stop-hyd-4', name: 'Kodad', lat: 16.9972, lng: 79.9678, distanceFromStartKm: 180.0, etaMinutes: 185, passed: false },
  { id: 'stop-hyd-5', name: 'Nandigama', lat: 16.7725, lng: 80.2922, distanceFromStartKm: 228.0, etaMinutes: 230, passed: false },
  { id: 'stop-hyd-6', name: 'PNBS Vijayawada', lat: 16.5097, lng: 80.6175, distanceFromStartKm: 275.0, etaMinutes: 280, passed: false }
];

// In-memory Mock Telemetry Database
let DEMO_BUS_FLEET: BusInfo[] = [
  // --- Vizianagaram to Parvathipuram Buses ---
  {
    id: 'bus-vzm-pvp-1',
    busNumber: 'AP 35 Z 4512',
    busName: 'APSRTC Super Luxury',
    busType: 'Super Luxury',
    operator: 'APSRTC',
    routeId: 'route-vzm-pvp',
    routeName: 'Vizianagaram → Parvathipuram',
    source: { id: 'src-vzm', name: 'Vizianagaram', displayName: 'Vizianagaram RTC Complex', lat: 18.1124, lng: 83.4070 },
    destination: { id: 'dst-pvp', name: 'Parvathipuram', displayName: 'Parvathipuram Old Complex', lat: 18.7788, lng: 83.4285 },
    stops: [
      { id: 'stop-vzm-1', name: 'Vizianagaram', lat: 18.1124, lng: 83.4070, distanceFromStartKm: 0, etaMinutes: 0, passed: true },
      { id: 'stop-vzm-2', name: 'Gajapathinagaram', lat: 18.2831, lng: 83.3328, distanceFromStartKm: 24.5, etaMinutes: 12, passed: false },
      { id: 'stop-vzm-3', name: 'Bobbili', lat: 18.5724, lng: 83.3644, distanceFromStartKm: 58.2, etaMinutes: 52, passed: false },
      { id: 'stop-vzm-4', name: 'Salur', lat: 18.5284, lng: 83.2120, distanceFromStartKm: 76.8, etaMinutes: 80, passed: false },
      { id: 'stop-vzm-5', name: 'Parvathipuram', lat: 18.7788, lng: 83.4285, distanceFromStartKm: 98.4, etaMinutes: 110, passed: false }
    ],
    currentStopIndex: 1,
    currentLocation: { name: 'Near Gajapathinagaram Toll Plaza', lat: 18.2610, lng: 83.3420 },
    nextStop: { id: 'stop-vzm-2', name: 'Gajapathinagaram', lat: 18.2831, lng: 83.3328, distanceFromStartKm: 24.5, etaMinutes: 12, passed: false },
    expectedArrivalTime: '07:45 PM',
    estimatedJourneyDuration: '1 hr 50 min',
    distanceRemainingKm: 75.2,
    delayMinutes: 0,
    status: 'on_time',
    speedKmH: 52,
    polylineCoordinates: VZM_PVP_POLYLINE,
    lastUpdated: 'Just now'
  },
  {
    id: 'bus-vzm-pvp-2',
    busNumber: 'AP 35 Y 8821',
    busName: 'APSRTC Express',
    busType: 'Express',
    operator: 'APSRTC',
    routeId: 'route-vzm-pvp',
    routeName: 'Vizianagaram → Parvathipuram',
    source: { id: 'src-vzm', name: 'Vizianagaram', displayName: 'Vizianagaram RTC Complex', lat: 18.1124, lng: 83.4070 },
    destination: { id: 'dst-pvp', name: 'Parvathipuram', displayName: 'Parvathipuram Old Complex', lat: 18.7788, lng: 83.4285 },
    stops: [
      { id: 'stop-vzm-1', name: 'Vizianagaram', lat: 18.1124, lng: 83.4070, distanceFromStartKm: 0, etaMinutes: 0, passed: true },
      { id: 'stop-vzm-2', name: 'Gajapathinagaram', lat: 18.2831, lng: 83.3328, distanceFromStartKm: 24.5, etaMinutes: 0, passed: true },
      { id: 'stop-vzm-3', name: 'Bobbili', lat: 18.5724, lng: 83.3644, distanceFromStartKm: 58.2, etaMinutes: 18, passed: false },
      { id: 'stop-vzm-4', name: 'Salur', lat: 18.5284, lng: 83.2120, distanceFromStartKm: 76.8, etaMinutes: 48, passed: false },
      { id: 'stop-vzm-5', name: 'Parvathipuram', lat: 18.7788, lng: 83.4285, distanceFromStartKm: 98.4, etaMinutes: 78, passed: false }
    ],
    currentStopIndex: 2,
    currentLocation: { name: 'Ramabhadrapuram Junction', lat: 18.4200, lng: 83.3480 },
    nextStop: { id: 'stop-vzm-3', name: 'Bobbili', lat: 18.5724, lng: 83.3644, distanceFromStartKm: 58.2, etaMinutes: 18, passed: false },
    expectedArrivalTime: '08:15 PM',
    estimatedJourneyDuration: '1 hr 18 min',
    distanceRemainingKm: 42.6,
    delayMinutes: 8,
    status: 'delayed',
    speedKmH: 48,
    polylineCoordinates: VZM_PVP_POLYLINE,
    lastUpdated: '12s ago'
  },
  {
    id: 'bus-vzm-pvp-3',
    busNumber: 'AP 31 TA 3390',
    busName: 'APSRTC Ultra Deluxe',
    busType: 'Ultra Deluxe',
    operator: 'APSRTC',
    routeId: 'route-vzm-pvp',
    routeName: 'Vizianagaram → Parvathipuram',
    source: { id: 'src-vzm', name: 'Vizianagaram', displayName: 'Vizianagaram RTC Complex', lat: 18.1124, lng: 83.4070 },
    destination: { id: 'dst-pvp', name: 'Parvathipuram', displayName: 'Parvathipuram Old Complex', lat: 18.7788, lng: 83.4285 },
    stops: [
      { id: 'stop-vzm-1', name: 'Vizianagaram', lat: 18.1124, lng: 83.4070, distanceFromStartKm: 0, etaMinutes: 5, passed: false },
      { id: 'stop-vzm-2', name: 'Gajapathinagaram', lat: 18.2831, lng: 83.3328, distanceFromStartKm: 24.5, etaMinutes: 40, passed: false },
      { id: 'stop-vzm-3', name: 'Bobbili', lat: 18.5724, lng: 83.3644, distanceFromStartKm: 58.2, etaMinutes: 80, passed: false },
      { id: 'stop-vzm-4', name: 'Salur', lat: 18.5284, lng: 83.2120, distanceFromStartKm: 76.8, etaMinutes: 110, passed: false },
      { id: 'stop-vzm-5', name: 'Parvathipuram', lat: 18.7788, lng: 83.4285, distanceFromStartKm: 98.4, etaMinutes: 140, passed: false }
    ],
    currentStopIndex: 0,
    currentLocation: { name: 'Departing Vizianagaram RTC Complex', lat: 18.1140, lng: 83.4065 },
    nextStop: { id: 'stop-vzm-2', name: 'Gajapathinagaram', lat: 18.2831, lng: 83.3328, distanceFromStartKm: 24.5, etaMinutes: 40, passed: false },
    expectedArrivalTime: '08:50 PM',
    estimatedJourneyDuration: '2 hr 20 min',
    distanceRemainingKm: 97.5,
    delayMinutes: 0,
    status: 'on_time',
    speedKmH: 28,
    polylineCoordinates: VZM_PVP_POLYLINE,
    lastUpdated: '5s ago'
  },
  {
    id: 'bus-vzm-pvp-4',
    busNumber: 'AP 35 Z 9004',
    busName: 'APSRTC Palle Velugu',
    busType: 'Palle Velugu',
    operator: 'APSRTC',
    routeId: 'route-vzm-pvp',
    routeName: 'Vizianagaram → Parvathipuram',
    source: { id: 'src-vzm', name: 'Vizianagaram', displayName: 'Vizianagaram RTC Complex', lat: 18.1124, lng: 83.4070 },
    destination: { id: 'dst-pvp', name: 'Parvathipuram', displayName: 'Parvathipuram Old Complex', lat: 18.7788, lng: 83.4285 },
    stops: [
      { id: 'stop-vzm-1', name: 'Vizianagaram', lat: 18.1124, lng: 83.4070, distanceFromStartKm: 0, etaMinutes: 0, passed: true },
      { id: 'stop-vzm-2', name: 'Gajapathinagaram', lat: 18.2831, lng: 83.3328, distanceFromStartKm: 24.5, etaMinutes: 0, passed: true },
      { id: 'stop-vzm-3', name: 'Bobbili', lat: 18.5724, lng: 83.3644, distanceFromStartKm: 58.2, etaMinutes: 0, passed: true },
      { id: 'stop-vzm-4', name: 'Salur', lat: 18.5284, lng: 83.2120, distanceFromStartKm: 76.8, etaMinutes: 0, passed: true },
      { id: 'stop-vzm-5', name: 'Parvathipuram', lat: 18.7788, lng: 83.4285, distanceFromStartKm: 98.4, etaMinutes: 14, passed: false }
    ],
    currentStopIndex: 4,
    currentLocation: { name: 'Seethanagaram Bypass', lat: 18.6800, lng: 83.3500 },
    nextStop: { id: 'stop-vzm-5', name: 'Parvathipuram', lat: 18.7788, lng: 83.4285, distanceFromStartKm: 98.4, etaMinutes: 14, passed: false },
    expectedArrivalTime: '07:15 PM',
    estimatedJourneyDuration: '14 min',
    distanceRemainingKm: 12.8,
    delayMinutes: 0,
    status: 'approaching',
    speedKmH: 45,
    polylineCoordinates: VZM_PVP_POLYLINE,
    lastUpdated: '1s ago'
  },

  // --- Visakhapatnam to Vizianagaram Buses ---
  {
    id: 'bus-vsp-vzm-1',
    busNumber: 'AP 31 Z 9001',
    busName: 'APSRTC Garuda Plus (AC)',
    busType: 'Garuda Plus',
    operator: 'APSRTC',
    routeId: 'route-vsp-vzm',
    routeName: 'Visakhapatnam → Vizianagaram',
    source: { id: 'src-vsp', name: 'Visakhapatnam', displayName: 'Dwaraka Bus Station (Vizag)', lat: 17.7275, lng: 83.3032 },
    destination: { id: 'dst-vzm', name: 'Vizianagaram', displayName: 'Vizianagaram RTC Complex', lat: 18.1124, lng: 83.4070 },
    stops: [
      { id: 'stop-vsp-1', name: 'Dwaraka Bus Station (Vizag)', lat: 17.7275, lng: 83.3032, distanceFromStartKm: 0, etaMinutes: 0, passed: true },
      { id: 'stop-vsp-2', name: 'Maddilapalem', lat: 17.7408, lng: 83.3325, distanceFromStartKm: 4.8, etaMinutes: 0, passed: true },
      { id: 'stop-vsp-3', name: 'Anandapuram', lat: 17.8920, lng: 83.3986, distanceFromStartKm: 26.3, etaMinutes: 15, passed: false },
      { id: 'stop-vsp-4', name: 'Tagarapuvalasa', lat: 17.9358, lng: 83.4475, distanceFromStartKm: 35.1, etaMinutes: 28, passed: false },
      { id: 'stop-vsp-5', name: 'Vizianagaram', lat: 18.1124, lng: 83.4070, distanceFromStartKm: 56.7, etaMinutes: 55, passed: false }
    ],
    currentStopIndex: 2,
    currentLocation: { name: 'PM Palem Cricket Stadium', lat: 17.7780, lng: 83.3600 },
    nextStop: { id: 'stop-vsp-3', name: 'Anandapuram', lat: 17.8920, lng: 83.3986, distanceFromStartKm: 26.3, etaMinutes: 15, passed: false },
    expectedArrivalTime: '07:30 PM',
    estimatedJourneyDuration: '55 min',
    distanceRemainingKm: 38.4,
    delayMinutes: 0,
    status: 'on_time',
    speedKmH: 60,
    polylineCoordinates: VSP_VZM_POLYLINE,
    lastUpdated: 'Just now'
  },
  {
    id: 'bus-vsp-vzm-2',
    busNumber: 'AP 35 Z 1144',
    busName: 'APSRTC Metro Express',
    busType: 'Express',
    operator: 'APSRTC',
    routeId: 'route-vsp-vzm',
    routeName: 'Visakhapatnam → Vizianagaram',
    source: { id: 'src-vsp', name: 'Visakhapatnam', displayName: 'Dwaraka Bus Station (Vizag)', lat: 17.7275, lng: 83.3032 },
    destination: { id: 'dst-vzm', name: 'Vizianagaram', displayName: 'Vizianagaram RTC Complex', lat: 18.1124, lng: 83.4070 },
    stops: [
      { id: 'stop-vsp-1', name: 'Dwaraka Bus Station (Vizag)', lat: 17.7275, lng: 83.3032, distanceFromStartKm: 0, etaMinutes: 0, passed: true },
      { id: 'stop-vsp-2', name: 'Maddilapalem', lat: 17.7408, lng: 83.3325, distanceFromStartKm: 4.8, etaMinutes: 0, passed: true },
      { id: 'stop-vsp-3', name: 'Anandapuram', lat: 17.8920, lng: 83.3986, distanceFromStartKm: 26.3, etaMinutes: 0, passed: true },
      { id: 'stop-vsp-4', name: 'Tagarapuvalasa', lat: 17.9358, lng: 83.4475, distanceFromStartKm: 35.1, etaMinutes: 12, passed: false },
      { id: 'stop-vsp-5', name: 'Vizianagaram', lat: 18.1124, lng: 83.4070, distanceFromStartKm: 56.7, etaMinutes: 38, passed: false }
    ],
    currentStopIndex: 3,
    currentLocation: { name: 'Tagarapuvalasa Bridge', lat: 17.9250, lng: 83.4400 },
    nextStop: { id: 'stop-vsp-4', name: 'Tagarapuvalasa', lat: 17.9358, lng: 83.4475, distanceFromStartKm: 35.1, etaMinutes: 12, passed: false },
    expectedArrivalTime: '07:48 PM',
    estimatedJourneyDuration: '38 min',
    distanceRemainingKm: 23.5,
    delayMinutes: 5,
    status: 'delayed',
    speedKmH: 42,
    polylineCoordinates: VSP_VZM_POLYLINE,
    lastUpdated: '15s ago'
  },

  // --- Vijayawada to Guntur Buses ---
  {
    id: 'bus-bza-gnt-1',
    busNumber: 'AP 16 Z 7788',
    busName: 'APSRTC Non-Stop Super Luxury',
    busType: 'Super Luxury',
    operator: 'APSRTC',
    routeId: 'route-bza-gnt',
    routeName: 'Vijayawada → Guntur',
    source: { id: 'src-bza', name: 'Vijayawada', displayName: 'PNBS Vijayawada', lat: 16.5097, lng: 80.6175 },
    destination: { id: 'dst-gnt', name: 'Guntur', displayName: 'Guntur NTR Bus Station', lat: 16.3067, lng: 80.4365 },
    stops: [
      { id: 'stop-bza-1', name: 'PNBS Vijayawada', lat: 16.5097, lng: 80.6175, distanceFromStartKm: 0, etaMinutes: 0, passed: true },
      { id: 'stop-bza-2', name: 'Kanaka Durga Varadhi', lat: 16.4950, lng: 80.6210, distanceFromStartKm: 3.5, etaMinutes: 0, passed: true },
      { id: 'stop-bza-3', name: 'Mangalagiri Bypass', lat: 16.4380, lng: 80.5620, distanceFromStartKm: 14.2, etaMinutes: 10, passed: false },
      { id: 'stop-bza-4', name: 'Nagarjuna University', lat: 16.3765, lng: 80.5280, distanceFromStartKm: 23.8, etaMinutes: 22, passed: false },
      { id: 'stop-bza-5', name: 'Guntur NTR Bus Station', lat: 16.3067, lng: 80.4365, distanceFromStartKm: 36.4, etaMinutes: 40, passed: false }
    ],
    currentStopIndex: 2,
    currentLocation: { name: 'Kunchanapalli Flyover', lat: 16.4650, lng: 80.5890 },
    nextStop: { id: 'stop-bza-3', name: 'Mangalagiri Bypass', lat: 16.4380, lng: 80.5620, distanceFromStartKm: 14.2, etaMinutes: 10, passed: false },
    expectedArrivalTime: '07:20 PM',
    estimatedJourneyDuration: '40 min',
    distanceRemainingKm: 24.8,
    delayMinutes: 0,
    status: 'on_time',
    speedKmH: 55,
    polylineCoordinates: BZA_GNT_POLYLINE,
    lastUpdated: '3s ago'
  },

  // --- Hyderabad to Vijayawada Buses ---
  {
    id: 'bus-hyd-bza-1',
    busNumber: 'TS 09 Z 4455',
    busName: 'TSRTC Garuda Plus AC',
    busType: 'Garuda Plus',
    operator: 'TSRTC',
    routeId: 'route-hyd-bza',
    routeName: 'Hyderabad (MGBS) → Vijayawada (PNBS)',
    source: { id: 'src-hyd', name: 'Hyderabad', displayName: 'MGBS Hyderabad', lat: 17.3786, lng: 78.4816 },
    destination: { id: 'dst-bza', name: 'Vijayawada', displayName: 'PNBS Vijayawada', lat: 16.5097, lng: 80.6175 },
    stops: [
      { id: 'stop-hyd-1', name: 'MGBS Hyderabad', lat: 17.3786, lng: 78.4816, distanceFromStartKm: 0, etaMinutes: 0, passed: true },
      { id: 'stop-hyd-2', name: 'LB Nagar', lat: 17.3486, lng: 78.5528, distanceFromStartKm: 12.5, etaMinutes: 0, passed: true },
      { id: 'stop-hyd-3', name: 'Suryapet', lat: 17.1439, lng: 79.6239, distanceFromStartKm: 135.0, etaMinutes: 45, passed: false },
      { id: 'stop-hyd-4', name: 'Kodad', lat: 16.9972, lng: 79.9678, distanceFromStartKm: 180.0, etaMinutes: 90, passed: false },
      { id: 'stop-hyd-5', name: 'Nandigama', lat: 16.7725, lng: 80.2922, distanceFromStartKm: 228.0, etaMinutes: 135, passed: false },
      { id: 'stop-hyd-6', name: 'PNBS Vijayawada', lat: 16.5097, lng: 80.6175, distanceFromStartKm: 275.0, etaMinutes: 180, passed: false }
    ],
    currentStopIndex: 2,
    currentLocation: { name: 'Choutuppal Toll Plaza', lat: 17.2476, lng: 78.9056 },
    nextStop: { id: 'stop-hyd-3', name: 'Suryapet', lat: 17.1439, lng: 79.6239, distanceFromStartKm: 135.0, etaMinutes: 45, passed: false },
    expectedArrivalTime: '10:45 PM',
    estimatedJourneyDuration: '3 hr 00 min',
    distanceRemainingKm: 215.0,
    delayMinutes: 0,
    status: 'on_time',
    speedKmH: 72,
    polylineCoordinates: HYD_BZA_POLYLINE,
    lastUpdated: 'Just now'
  }
];

export class BusService {
  /**
   * Search for buses operating between given source and destination names.
   */
  public searchBuses(from: string, to: string): BusInfo[] {
    const cleanFrom = from.trim().toLowerCase();
    const cleanTo = to.trim().toLowerCase();

    if (!cleanFrom && !cleanTo) {
      return [...DEMO_BUS_FLEET];
    }

    return DEMO_BUS_FLEET.filter((bus) => {
      const matchFrom = !cleanFrom || 
        bus.source.name.toLowerCase().includes(cleanFrom) || 
        bus.source.displayName.toLowerCase().includes(cleanFrom) ||
        bus.routeName.toLowerCase().includes(cleanFrom);

      const matchTo = !cleanTo || 
        bus.destination.name.toLowerCase().includes(cleanTo) || 
        bus.destination.displayName.toLowerCase().includes(cleanTo) ||
        bus.routeName.toLowerCase().includes(cleanTo);

      return matchFrom && matchTo;
    });
  }

  /**
   * Look up a bus directly by its registration number (e.g. "AP 35 Z 4512" or "4512").
   */
  public getBusByNumber(busNumber: string): BusInfo | null {
    const clean = busNumber.trim().toUpperCase().replace(/\s+/g, '');
    if (!clean) return null;

    return (
      DEMO_BUS_FLEET.find((b) => b.busNumber.replace(/\s+/g, '').toUpperCase().includes(clean)) || null
    );
  }

  /**
   * Returns list of popular curated bus routes for instant 1-click search.
   */
  public getPopularRoutes(): { from: string; to: string; count: number; label: string }[] {
    return [
      { from: 'Vizianagaram', to: 'Parvathipuram', count: 4, label: 'Vizianagaram → Parvathipuram' },
      { from: 'Visakhapatnam', to: 'Vizianagaram', count: 2, label: 'Visakhapatnam → Vizianagaram' },
      { from: 'Vijayawada', to: 'Guntur', count: 1, label: 'Vijayawada → Guntur' },
      { from: 'Hyderabad', to: 'Vijayawada', count: 1, label: 'Hyderabad → Vijayawada' }
    ];
  }

  /**
   * Step simulation: Moves the demo bus forward along its polyline route,
   * recalculates remaining distance, updates next stop, adjusts ETAs, and simulates live GPS movement.
   */
  public simulateBusMovement(bus: BusInfo): BusInfo {
    const coords = bus.polylineCoordinates;
    if (!coords || coords.length === 0) return bus;

    // Find current closest index on polyline
    let closestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < coords.length; i++) {
      const d = calculateHaversineDistance(
        bus.currentLocation.lat,
        bus.currentLocation.lng,
        coords[i][0],
        coords[i][1]
      );
      if (d < minDist) {
        minDist = d;
        closestIdx = i;
      }
    }

    // Advance by 2 steps along polyline
    const nextIdx = Math.min(coords.length - 1, closestIdx + 2);
    const newCoord = coords[nextIdx];
    const isAtEnd = nextIdx >= coords.length - 1;

    // Calculate remaining distance to destination
    let remDist = 0;
    for (let i = nextIdx; i < coords.length - 1; i++) {
      remDist += calculateHaversineDistance(coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1]);
    }
    const remKm = Number((remDist / 1000).toFixed(1));

    // Dynamic speed with realistic slight variation (45 - 65 km/h)
    const baseSpeed = isAtEnd ? 0 : Math.max(30, Math.min(70, bus.speedKmH + (Math.random() * 6 - 3)));
    const speed = Math.round(baseSpeed);

    // Calculate minutes to reach destination
    const minutesRemaining = speed > 0 ? Math.round((remKm / speed) * 60) : 0;
    const now = new Date();
    const etaDate = new Date(now.getTime() + minutesRemaining * 60 * 1000);
    const etaFormatted = isAtEnd ? 'Arrived' : etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update stops passed status and calculate dynamic stop ETAs
    let nextUpcomingStop: BusStop = bus.stops[bus.stops.length - 1];
    let foundUpcoming = false;

    const updatedStops = bus.stops.map((stop) => {
      const distToStop = calculateHaversineDistance(newCoord[0], newCoord[1], stop.lat, stop.lng);
      const isPassed = isAtEnd || distToStop < 400 || (stop.distanceFromStartKm < (bus.stops[bus.stops.length - 1].distanceFromStartKm - remKm - 0.5));
      
      const stopEtaMins = isPassed ? 0 : Math.round(((distToStop / 1000) / Math.max(speed, 25)) * 60);

      const updated = {
        ...stop,
        passed: isPassed,
        etaMinutes: stopEtaMins
      };

      if (!isPassed && !foundUpcoming) {
        nextUpcomingStop = updated;
        foundUpcoming = true;
      }

      return updated;
    });

    const status = isAtEnd
      ? 'arrived'
      : minutesRemaining <= 10
      ? 'approaching'
      : bus.delayMinutes > 0
      ? 'delayed'
      : 'on_time';

    const locationName = isAtEnd
      ? `${bus.destination.name} (Destination Reached)`
      : `En-route to ${nextUpcomingStop.name}`;

    const updatedBus: BusInfo = {
      ...bus,
      currentLocation: {
        name: locationName,
        lat: newCoord[0],
        lng: newCoord[1]
      },
      nextStop: nextUpcomingStop,
      stops: updatedStops,
      distanceRemainingKm: remKm,
      expectedArrivalTime: etaFormatted,
      estimatedJourneyDuration: isAtEnd ? 'Arrived' : minutesRemaining > 60 ? `${Math.floor(minutesRemaining / 60)} hr ${minutesRemaining % 60} min` : `${minutesRemaining} min`,
      speedKmH: speed,
      status,
      lastUpdated: 'Just now'
    };

    // Update local DB cache
    DEMO_BUS_FLEET = DEMO_BUS_FLEET.map((b) => (b.id === updatedBus.id ? updatedBus : b));

    return updatedBus;
  }
}

export const busService = new BusService();
