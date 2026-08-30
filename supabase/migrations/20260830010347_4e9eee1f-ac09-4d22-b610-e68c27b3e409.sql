ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz;

CREATE OR REPLACE FUNCTION public.item_is_visible(_seller_id uuid, _created_at timestamptz)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sellers s
    WHERE s.id = _seller_id AND s.phone_verified_at IS NOT NULL
  ) OR _created_at > now() - interval '24 hours';
$$;

DROP POLICY IF EXISTS "Public can view listings" ON public.items;
CREATE POLICY "Public can view listings"
ON public.items FOR SELECT
TO anon, authenticated
USING (status <> 'removed' AND public.item_is_visible(seller_id, created_at));

CREATE OR REPLACE FUNCTION public.verify_phone_from_sms(_from text, _body text)
RETURNS TABLE(seller_id uuid, bay_handle text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _digits text;
  _tail text;
BEGIN
  IF upper(coalesce(_body, '')) NOT LIKE '%VERIFY%' THEN
    RETURN;
  END IF;
  _digits := regexp_replace(coalesce(_from, ''), '[^0-9]', '', 'g');
  IF length(_digits) < 7 THEN
    RETURN;
  END IF;
  _tail := right(_digits, 10);

  RETURN QUERY
  UPDATE public.sellers s
  SET phone_verified_at = coalesce(s.phone_verified_at, now())
  WHERE right(s.phone_number, 10) = _tail
  RETURNING s.id, s.bay_handle;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_phone_from_sms(text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_phone_from_sms(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.item_is_visible(uuid, timestamptz) TO anon, authenticated, service_role;