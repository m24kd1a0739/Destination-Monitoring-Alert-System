export interface ServerlessRequest {
  method?: string;
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type');
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  const { busId } = req.query;
  const idStr = Array.isArray(busId) ? busId[0] : busId;

  if (!idStr) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Bus identifier is required in query parameter.'
    });
  }

  const KNOWN_FLEET: Record<string, { busNumber: string; busName: string; routeName: string }> = {
    'bus-vzm-pvp-101': { busNumber: 'AP 35 Z 4512', busName: 'APSRTC Super Luxury', routeName: 'Vizianagaram → Parvathipuram' },
    'bus-vsp-vzm-201': { busNumber: 'AP 31 Z 9001', busName: 'APSRTC Garuda Plus (AC)', routeName: 'Visakhapatnam → Vizianagaram' },
    'bus-bza-gnt-301': { busNumber: 'AP 16 Z 7788', busName: 'APSRTC Non-Stop Super Luxury', routeName: 'Vijayawada → Guntur' },
    'bus-hyd-bza-401': { busNumber: 'TS 09 Z 4455', busName: 'TSRTC Garuda Plus AC', routeName: 'Hyderabad (MGBS) → Vijayawada (PNBS)' }
  };

  const found = KNOWN_FLEET[idStr];
  if (!found) {
    return res.status(404).json({
      status: 'BUS_NOT_FOUND',
      busId: idStr,
      location: null,
      message: `Bus '${idStr}' is not registered in the transit database.`
    });
  }

  return res.status(200).json({
    status: 'DATA_UNAVAILABLE',
    busId: idStr,
    busNumber: found.busNumber,
    busName: found.busName,
    routeName: found.routeName,
    location: null,
    message: 'No verified GPS location is currently available for this vehicle.',
    freshnessThresholdSeconds: 45
  });
}
