CREATE OR REPLACE FUNCTION public.update_seller_phone(_seller_id uuid, _seller_key uuid, _phone text)
RETURNS TABLE(seller_id uuid, bay_handle text, phone_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _digits text;
  _base text;
  _candidate text;
  _n int := 1;
  _row public.sellers%ROWTYPE;
BEGIN
  _digits := regexp_replace(coalesce(_phone, ''), '[^0-9]', '', 'g');
  IF length(_digits) < 7 OR length(_digits) > 15 THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;

  SELECT * INTO _row FROM public.sellers s WHERE s.id = _seller_id AND s.seller_key = _seller_key;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  IF _row.phone_number = _digits THEN
    RETURN QUERY SELECT _row.id, _row.bay_handle, _row.phone_number;
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM public.sellers s WHERE s.phone_number = _digits AND s.id <> _seller_id) THEN
    RAISE EXCEPTION 'That number already has a bay';
  END IF;

  _base := 'bay' || right(_digits, 4);
  _candidate := _base;
  WHILE EXISTS (SELECT 1 FROM public.sellers s WHERE s.bay_handle = _candidate AND s.id <> _seller_id) LOOP
    _n := _n + 1;
    _candidate := _base || '-' || _n;
  END LOOP;

  UPDATE public.sellers s
  SET phone_number = _digits,
      bay_handle = _candidate,
      phone_verified_at = NULL
  WHERE s.id = _seller_id
  RETURNING * INTO _row;

  RETURN QUERY SELECT _row.id, _row.bay_handle, _row.phone_number;
END;
$function$;

REVOKE ALL ON FUNCTION public.update_seller_phone(uuid, uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.update_seller_phone(uuid, uuid, text) TO anon, authenticated, service_role;