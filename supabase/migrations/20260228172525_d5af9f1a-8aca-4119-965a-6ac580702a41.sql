
-- Community reports table for danger zones and realtime events
CREATE TABLE public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  layer TEXT NOT NULL CHECK (layer IN ('danger', 'realtime')),
  emoji TEXT NOT NULL,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can read reports (community feature)
CREATE POLICY "Anyone can view reports"
  ON public.community_reports
  FOR SELECT
  USING (true);

-- Anyone can insert reports
CREATE POLICY "Anyone can insert reports"
  ON public.community_reports
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_reports;
