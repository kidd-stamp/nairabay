CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.items(id) ON DELETE SET NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.reports TO service_role;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public report reads" ON public.reports AS RESTRICTIVE FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "No public report inserts" ON public.reports AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No public report updates" ON public.reports AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false);
CREATE POLICY "No public report deletes" ON public.reports AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);

CREATE INDEX reports_seller_id_idx ON public.reports (seller_id);

CREATE OR REPLACE FUNCTION public.report_bay(_bay_handle text, _reason text, _details text DEFAULT NULL, _item_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _seller_id uuid;
  _clean_reason text := btrim(coalesce(_reason, ''));
BEGIN
  IF _clean_reason NOT IN ('Fake or stolen photos', 'Asking for payment before inspection', 'Scam or fraud attempt', 'Banned or illegal item', 'Abusive or harassing behaviour', 'Something else') THEN
    RAISE EXCEPTION 'Invalid reason';
  END IF;

  IF _details IS NOT NULL AND length(_details) > 500 THEN
    RAISE EXCEPTION 'Details too long';
  END IF;

  SELECT s.id INTO _seller_id FROM public.sellers s WHERE s.bay_handle = btrim(coalesce(_bay_handle, ''));
  IF _seller_id IS NULL THEN
    RAISE EXCEPTION 'Unknown bay';
  END IF;

  INSERT INTO public.reports (seller_id, item_id, reason, details)
  VALUES (_seller_id, _item_id, _clean_reason, nullif(btrim(coalesce(_details, '')), ''));

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.report_bay(text, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_bay(text, text, text, uuid) TO anon, authenticated, service_role;