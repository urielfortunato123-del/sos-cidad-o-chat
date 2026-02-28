
-- Table for broadcast alerts sent by admins (Civil Defense)
CREATE TABLE public.broadcast_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.broadcast_alerts ENABLE ROW LEVEL SECURITY;

-- Anyone can read active alerts
CREATE POLICY "Anyone can view active alerts"
  ON public.broadcast_alerts FOR SELECT
  USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert alerts"
  ON public.broadcast_alerts FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update (deactivate)
CREATE POLICY "Admins can update alerts"
  ON public.broadcast_alerts FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for broadcast alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_alerts;
