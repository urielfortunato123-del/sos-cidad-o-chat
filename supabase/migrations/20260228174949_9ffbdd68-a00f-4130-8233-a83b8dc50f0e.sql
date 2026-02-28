
-- Add severity and expires_at to community_reports
ALTER TABLE public.community_reports
  ADD COLUMN IF NOT EXISTS severity integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- Create a validation trigger to ensure severity is 1-5
CREATE OR REPLACE FUNCTION public.validate_community_report()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.severity < 1 OR NEW.severity > 5 THEN
    RAISE EXCEPTION 'severity must be between 1 and 5';
  END IF;
  -- Auto-set expires_at if not provided (default 3 hours for realtime, 7 days for danger)
  IF NEW.expires_at IS NULL THEN
    IF NEW.layer = 'realtime' THEN
      NEW.expires_at := now() + interval '3 hours';
    ELSE
      NEW.expires_at := now() + interval '7 days';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_community_report
  BEFORE INSERT OR UPDATE ON public.community_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_community_report();
