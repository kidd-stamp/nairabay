CREATE TABLE public.sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  bay_handle text UNIQUE NOT NULL,
  display_name text,
  location_state text,
  location_city text,
  seller_key uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  title text NOT NULL,
  price numeric(12,2) NOT NULL,
  category text NOT NULL,
  description text,
  image_path text NOT NULL,
  location_state text,
  location_city text,
  status text NOT NULL DEFAULT 'active',
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX items_created_at_idx ON public.items (created_at DESC);
CREATE INDEX items_seller_idx ON public.items (seller_id);

GRANT SELECT, INSERT ON public.items TO anon, authenticated;
GRANT ALL ON public.items TO service_role;
GRANT INSERT ON public.sellers TO anon, authenticated;
GRANT ALL ON public.sellers TO service_role;

ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view listings" ON public.items FOR SELECT TO anon, authenticated USING (status <> 'removed');
CREATE POLICY "Anyone can post an item" ON public.items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can create a seller" ON public.sellers FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE VIEW public.sellers_public AS
  SELECT id, phone_number, bay_handle, display_name, location_state, location_city, created_at
  FROM public.sellers;

GRANT SELECT ON public.sellers_public TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.claim_bay(_phone text, _display_name text DEFAULT NULL, _state text DEFAULT NULL, _city text DEFAULT NULL)
RETURNS TABLE (seller_id uuid, bay_handle text, seller_key uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  SELECT * INTO _row FROM public.sellers s WHERE s.phone_number = _digits;
  IF FOUND THEN
    RETURN QUERY SELECT _row.id, _row.bay_handle, _row.seller_key;
    RETURN;
  END IF;

  _base := 'bay' || right(_digits, 4);
  _candidate := _base;
  WHILE EXISTS (SELECT 1 FROM public.sellers s WHERE s.bay_handle = _candidate) LOOP
    _n := _n + 1;
    _candidate := _base || '-' || _n;
  END LOOP;

  INSERT INTO public.sellers (phone_number, bay_handle, display_name, location_state, location_city)
  VALUES (_digits, _candidate, nullif(btrim(coalesce(_display_name, '')), ''), _state, _city)
  RETURNING * INTO _row;

  RETURN QUERY SELECT _row.id, _row.bay_handle, _row.seller_key;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_bay(text, text, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_item_status(_item_id uuid, _seller_key uuid, _status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count int;
BEGIN
  IF _status NOT IN ('active', 'sold', 'removed') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE public.items i
  SET status = _status
  WHERE i.id = _item_id
    AND EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = i.seller_id AND s.seller_key = _seller_key);

  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_item_status(uuid, uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.bump_item_views(_item_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.items SET views = views + 1 WHERE id = _item_id;
$$;

GRANT EXECUTE ON FUNCTION public.bump_item_views(uuid) TO anon, authenticated;

CREATE POLICY "Public can view item photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'item-photos');
CREATE POLICY "Anyone can upload item photos" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'item-photos');