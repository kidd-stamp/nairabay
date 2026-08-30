DROP POLICY IF EXISTS "Anyone can post an item" ON public.items;

CREATE POLICY "No direct item inserts"
ON public.items
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

REVOKE INSERT ON public.items FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_item(
  _seller_id uuid,
  _seller_key uuid,
  _title text,
  _price numeric,
  _category text,
  _image_path text,
  _description text DEFAULT NULL,
  _state text DEFAULT NULL,
  _city text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
  _clean_title text := btrim(coalesce(_title, ''));
  _clean_category text := btrim(coalesce(_category, ''));
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.sellers s
    WHERE s.id = _seller_id AND s.seller_key = _seller_key
  ) THEN
    RAISE EXCEPTION 'Not authorized to post for this seller';
  END IF;

  IF length(_clean_title) < 3 OR length(_clean_title) > 100 THEN
    RAISE EXCEPTION 'Invalid title';
  END IF;
  IF _price IS NULL OR _price <= 0 OR _price > 1000000000 THEN
    RAISE EXCEPTION 'Invalid price';
  END IF;
  IF length(_clean_category) < 1 OR length(_clean_category) > 50 THEN
    RAISE EXCEPTION 'Invalid category';
  END IF;
  IF _image_path IS NULL OR _image_path !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|heic|heif|gif)$' THEN
    RAISE EXCEPTION 'Invalid image';
  END IF;
  IF _description IS NOT NULL AND length(_description) > 500 THEN
    RAISE EXCEPTION 'Description too long';
  END IF;

  INSERT INTO public.items (seller_id, title, price, category, description, image_path, location_state, location_city)
  VALUES (
    _seller_id,
    _clean_title,
    _price,
    _clean_category,
    nullif(btrim(coalesce(_description, '')), ''),
    _image_path,
    nullif(btrim(coalesce(_state, '')), ''),
    nullif(btrim(coalesce(_city, '')), '')
  )
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_item(uuid, uuid, text, numeric, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_item(uuid, uuid, text, numeric, text, text, text, text, text) TO anon, authenticated, service_role;