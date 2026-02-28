
-- Push subscriptions for weather alerts
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  city text,
  state text,
  lat double precision,
  lng double precision,
  created_at timestamptz DEFAULT now(),
  UNIQUE(endpoint)
);

-- RLS: anyone can insert/select/delete their own subscriptions (by endpoint)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view subscriptions" ON public.push_subscriptions FOR SELECT USING (true);
CREATE POLICY "Anyone can delete own subscription" ON public.push_subscriptions FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.push_subscriptions;
