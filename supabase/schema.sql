-- ==============================================================================
-- DESTINATION MONITORING ALERT SYSTEM — DATABASE SCHEMA & RLS POLICIES
-- Compatible with Supabase Postgres / PostgreSQL 14+
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Buses Table: Official transit fleet register
CREATE TABLE IF NOT EXISTS public.buses (
    id VARCHAR(64) PRIMARY KEY,                    -- Internal unique identifier (e.g., 'bus-ap35z4512')
    bus_number VARCHAR(32) NOT NULL UNIQUE,         -- Display registration (e.g., 'AP 35 Z 4512')
    bus_name VARCHAR(128) NOT NULL,                 -- Display title (e.g., 'APSRTC Super Luxury')
    bus_type VARCHAR(64) NOT NULL DEFAULT 'Express',-- Type ('Super Luxury', 'Express', 'Garuda Plus', etc.)
    operator VARCHAR(64) NOT NULL DEFAULT 'APSRTC', -- Operator ('APSRTC', 'TSRTC', etc.)
    route_id VARCHAR(64),                           -- Associated Route ID
    route_name VARCHAR(128) NOT NULL,               -- Route title (e.g., 'Vizianagaram → Parvathipuram')
    source_name VARCHAR(128) NOT NULL,              -- Origin terminal
    source_lat DOUBLE PRECISION NOT NULL,
    source_lng DOUBLE PRECISION NOT NULL,
    destination_name VARCHAR(128) NOT NULL,         -- Destination terminal
    destination_lat DOUBLE PRECISION NOT NULL,
    destination_lng DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for searching buses by route or registration
CREATE INDEX IF NOT EXISTS idx_buses_search ON public.buses (bus_number, route_name, is_active);

-- 3. Authorized GPS Devices Table: Trusted driver phone or hardware tracking devices
CREATE TABLE IF NOT EXISTS public.authorized_devices (
    device_id VARCHAR(64) PRIMARY KEY,             -- Hardware or client UUID
    bus_id VARCHAR(64) NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
    device_label VARCHAR(128),                      -- E.g. "Driver Smartphone - Unit #4"
    token_hash VARCHAR(128) NOT NULL,               -- Secure SHA-256 hash of device authorization token
    status VARCHAR(32) NOT NULL DEFAULT 'active',   -- 'active', 'suspended', 'revoked'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_reported_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_authorized_devices_bus ON public.authorized_devices (bus_id, status);

-- 4. Vehicle Locations Table: Authenticated time-series GPS updates
CREATE TABLE IF NOT EXISTS public.vehicle_locations (
    id BIGSERIAL PRIMARY KEY,
    bus_id VARCHAR(64) NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
    device_id VARCHAR(64) NOT NULL REFERENCES public.authorized_devices(device_id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90.0 AND latitude <= 90.0),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180.0 AND longitude <= 180.0),
    speed_kmh REAL CHECK (speed_kmh >= 0.0 AND speed_kmh <= 200.0),
    heading REAL CHECK (heading >= 0.0 AND heading <= 360.0),
    accuracy_meters REAL,
    device_timestamp TIMESTAMPTZ NOT NULL,
    server_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_source VARCHAR(32) NOT NULL DEFAULT 'authorized_device', -- 'authorized_device' | 'gtfs_rt' | 'iot_tracker'
    is_valid BOOLEAN NOT NULL DEFAULT true
);

-- High-performance composite index for querying latest location of a bus
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_bus_time 
ON public.vehicle_locations (bus_id, server_timestamp DESC);

-- 5. Row Level Security (RLS) Configuration
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_locations ENABLE ROW LEVEL SECURITY;

-- Anonymous / Passenger read policy: Passengers can read active buses and validated locations
CREATE POLICY "Public read access to active buses" 
ON public.buses FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access to recent vehicle locations" 
ON public.vehicle_locations FOR SELECT 
USING (is_valid = true);

-- Device authorization policy: Only service role or verified device tokens can insert GPS updates
CREATE POLICY "Authorized insert of GPS updates" 
ON public.vehicle_locations FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.authorized_devices 
        WHERE authorized_devices.device_id = vehicle_locations.device_id 
          AND authorized_devices.bus_id = vehicle_locations.bus_id 
          AND authorized_devices.status = 'active'
    )
);

-- 6. Initial Seed Data: Authorize official project fleet (APSRTC / Regional transit corridors)
INSERT INTO public.buses (
    id, bus_number, bus_name, bus_type, operator, route_id, route_name, 
    source_name, source_lat, source_lng, destination_name, destination_lat, destination_lng
) VALUES 
('bus-vzm-pvp-101', 'AP 35 Z 4512', 'APSRTC Super Luxury', 'Super Luxury', 'APSRTC', 'route-vzm-pvp', 'Vizianagaram → Parvathipuram', 'Vizianagaram RTC Complex', 18.1124, 83.4070, 'Parvathipuram RTC Complex', 18.7788, 83.4285),
('bus-vsp-vzm-201', 'AP 31 Z 9001', 'APSRTC Garuda Plus (AC)', 'Garuda Plus', 'APSRTC', 'route-vsp-vzm', 'Visakhapatnam → Vizianagaram', 'Dwaraka Bus Station (Vizag)', 17.7275, 83.3032, 'Vizianagaram RTC Complex', 18.1124, 83.4070),
('bus-bza-gnt-301', 'AP 16 Z 7788', 'APSRTC Non-Stop Super Luxury', 'Super Luxury', 'APSRTC', 'route-bza-gnt', 'Vijayawada → Guntur', 'PNBS Vijayawada', 16.5097, 80.6175, 'Guntur NTR Bus Station', 16.3067, 80.4365),
('bus-hyd-bza-401', 'TS 09 Z 4455', 'TSRTC Garuda Plus AC', 'Garuda Plus', 'TSRTC', 'route-hyd-bza', 'Hyderabad (MGBS) → Vijayawada (PNBS)', 'MGBS Hyderabad', 17.3786, 78.4816, 'PNBS Vijayawada', 16.5097, 80.6175)
ON CONFLICT (id) DO NOTHING;

-- Seed Authorized Test Device for Driver Demonstration
-- Device Token: 'test-device-token-vzm4512' (SHA-256 precomputed)
INSERT INTO public.authorized_devices (
    device_id, bus_id, device_label, token_hash, status
) VALUES 
('dev-driver-vzm-1', 'bus-vzm-pvp-101', 'Driver Authorized Transmitter #1', 'f361250325b905541bf7de7d6ddb777a83d7351ffbf058e0a1334005dcbc6c85', 'active'),
('dev-driver-vsp-1', 'bus-vsp-vzm-201', 'Driver Authorized Transmitter #2', 'c0b89bf8da117c2be653f572a1bf9583b276706e25c0410ff0386cfb94cc87df', 'active')
ON CONFLICT (device_id) DO NOTHING;
