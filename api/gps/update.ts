export interface ServerlessRequest {
  method?: string;
  body?: any;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
}

export interface ServerlessResponse {
  status: (code: number) => ServerlessResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

function setCorsHeaders(res: ServerlessResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Device-Token'
  );
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { busId, deviceId, latitude, longitude, speedKmH, heading, accuracyMeters, timestamp } = req.body || {};
    const authHeader = req.headers['authorization'] || req.headers['x-device-token'];
    const deviceToken = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : req.body?.deviceToken;

    if (!deviceToken) {
      return res.status(401).json({
        success: false,
        error: 'Missing device authorization credentials. Provide Bearer token or deviceToken field.'
      });
    }

    if (!busId || !deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: busId and deviceId are required.'
      });
    }

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates. Latitude must be between -90 and 90; Longitude between -180 and 180.'
      });
    }

    const now = new Date();
    const serverTimestamp = now.toISOString();

    return res.status(200).json({
      success: true,
      message: `GPS telemetry accepted for bus ${busId}`,
      receivedAt: serverTimestamp,
      data: {
        busId,
        deviceId,
        latitude,
        longitude,
        speedKmH: speedKmH || 0,
        heading: heading || 0,
        accuracyMeters,
        deviceTimestamp: timestamp || serverTimestamp,
        serverTimestamp,
        dataSource: 'authorized_device',
        isValid: true
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error processing GPS update'
    });
  }
}
