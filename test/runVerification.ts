/**
 * AUTOMATED SYSTEM & CONTRACT VERIFICATION SUITE
 * ===============================================
 * Validates GPS Backend security rules, coordinate validation,
 * freshness status transitions, and routing error handling.
 */

import { gpsBackendService } from '../src/services/gpsBackendService';
import { isValidCoordinate, calculateHaversineDistance } from '../src/services/routing';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, failureDetail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} - ${failureDetail || 'Assertion failed'}`);
  }
}

async function runAllVerificationTests() {
  console.log('\n======================================================');
  console.log('DESTINATION MONITORING ALERT SYSTEM — TEST VERIFICATION');
  console.log('======================================================\n');

  // Group 1: Coordinate & Mathematical Validation
  console.log('[1] Coordinate & Distance Validation:');
  assert(isValidCoordinate(17.7275, 83.3032), 'Valid coordinates accepted (Vizag)');
  assert(!isValidCoordinate(95.0, 80.0), 'Out-of-range latitude (>90) rejected');
  assert(!isValidCoordinate(15.0, 195.0), 'Out-of-range longitude (>180) rejected');
  assert(!isValidCoordinate(NaN as any, 80.0), 'NaN coordinate rejected');

  const distMeters = calculateHaversineDistance(17.7275, 83.3032, 18.1124, 83.4070);
  assert(distMeters > 40000 && distMeters < 50000, `Haversine distance between Vizag and VZM is ~44km (got ${Math.round(distMeters / 1000)}km)`);

  // Group 2: Fleet Registry Lookup
  console.log('\n[2] Bus Fleet Registry:');
  const buses = gpsBackendService.listRegisteredBuses();
  assert(buses.length >= 4, `At least 4 fleet buses registered (found ${buses.length})`);
  
  const vzmBus = gpsBackendService.findBus('AP 35 Z 4512');
  assert(vzmBus !== null && vzmBus.id === 'bus-vzm-pvp-101', 'Found registered bus by registration plate');

  const unknownBus = gpsBackendService.findBus('UNKNOWN-999');
  assert(unknownBus === null, 'Unknown bus returns null');

  // Group 3: Truthful Status Transitions
  console.log('\n[3] Bus Location Lookup & Freshness States:');
  // A. Bus with no updates -> DATA_UNAVAILABLE
  const initialStatus = gpsBackendService.getBusLocation('bus-bza-gnt-301');
  assert(initialStatus.status === 'DATA_UNAVAILABLE', 'Unreported bus returns status DATA_UNAVAILABLE');
  assert(initialStatus.location === null, 'DATA_UNAVAILABLE does not fabricate coordinates');

  // B. Unknown bus -> BUS_NOT_FOUND
  const notFoundStatus = gpsBackendService.getBusLocation('NON_EXISTENT_BUS_ID');
  assert(notFoundStatus.status === 'BUS_NOT_FOUND', 'Non-existent bus returns BUS_NOT_FOUND');

  // Group 4: Device Authentication & Security
  console.log('\n[4] Device Authentication & Authorization:');
  // A. Unauthorized token
  const unauthorizedRes = gpsBackendService.submitGpsUpdate({
    deviceToken: 'MALICIOUS_ATTACKER_TOKEN',
    deviceId: 'dev-driver-vzm-1',
    busId: 'bus-vzm-pvp-101',
    latitude: 18.12,
    longitude: 83.41,
    timestamp: Date.now()
  });
  assert(!unauthorizedRes.success, 'Unauthorized device token is strictly rejected');

  // B. Wrong device-to-bus association
  const mismatchedRes = gpsBackendService.submitGpsUpdate({
    deviceToken: 'dev-token-vzm4512-secure',
    deviceId: 'dev-driver-vzm-1',
    busId: 'bus-hyd-bza-401', // device #1 is NOT permitted for hyd-bza bus
    latitude: 17.38,
    longitude: 78.48,
    timestamp: Date.now()
  });
  assert(!mismatchedRes.success, 'Mismatched device-to-bus assignment rejected');

  // C. Valid authorized update
  const validRes = gpsBackendService.submitGpsUpdate({
    deviceToken: 'dev-token-vzm4512-secure',
    deviceId: 'dev-driver-vzm-1',
    busId: 'bus-vzm-pvp-101',
    latitude: 18.1500,
    longitude: 83.3900,
    speedKmH: 48,
    accuracyMeters: 6,
    timestamp: Date.now()
  });
  assert(validRes.success, 'Authorized device update is accepted');

  // D. Verify status is now LIVE
  const liveStatus = gpsBackendService.getBusLocation('bus-vzm-pvp-101');
  assert(liveStatus.status === 'LIVE', 'Recently updated bus returns status LIVE');
  assert(liveStatus.location !== null && liveStatus.location.latitude === 18.1500, 'Live coordinates reflect verified update');

  console.log('\n======================================================');
  console.log(`VERIFICATION SUMMARY: ${passedTests}/${totalTests} tests passed (${failedTests} failed)`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllVerificationTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
