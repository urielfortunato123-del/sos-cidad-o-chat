
-- POIs table
CREATE TABLE IF NOT EXISTS public.pois (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'manual',
  name text NOT NULL,
  category text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pois_category_idx ON public.pois(category);
CREATE INDEX IF NOT EXISTS pois_city_state_idx ON public.pois(city, state);
CREATE INDEX IF NOT EXISTS pois_lat_lng_idx ON public.pois(lat, lng);

ALTER TABLE public.pois ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read pois" ON public.pois FOR SELECT USING (true);
CREATE POLICY "Admin write pois" ON public.pois FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Hazard zones
CREATE TABLE IF NOT EXISTS public.hazard_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'manual',
  hazard_type text NOT NULL,
  risk_level int NOT NULL DEFAULT 3,
  name text,
  city text,
  state text,
  geom jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hazard_city_state_idx ON public.hazard_zones(city, state);

ALTER TABLE public.hazard_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read hazard_zones" ON public.hazard_zones FOR SELECT USING (true);
CREATE POLICY "Admin write hazard_zones" ON public.hazard_zones FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Live events (crowdsourced)
CREATE TABLE IF NOT EXISTS public.live_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  severity int NOT NULL DEFAULT 3,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '3 hours'),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  photo_url text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS live_status_exp_idx ON public.live_events(status, expires_at);
CREATE INDEX IF NOT EXISTS live_lat_lng_idx ON public.live_events(lat, lng);

ALTER TABLE public.live_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active live_events" ON public.live_events FOR SELECT USING (status = 'active');
CREATE POLICY "Anyone can insert live_events" ON public.live_events FOR INSERT WITH CHECK (true);

-- User profiles + QR
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  blood_type text,
  allergies text,
  medical_notes text,
  emergency_contacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  qr_token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS profiles_qr_idx ON public.user_profiles(qr_token);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can manage own profile" ON public.user_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public read by qr_token" ON public.user_profiles FOR SELECT USING (true);

-- Enable realtime for live_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_events;

-- Storage bucket for report photos
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload to reports" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reports');
CREATE POLICY "Public read reports" ON storage.objects FOR SELECT USING (bucket_id = 'reports');
