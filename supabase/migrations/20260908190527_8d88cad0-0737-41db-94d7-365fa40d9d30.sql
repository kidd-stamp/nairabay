ALTER TABLE public.items ADD COLUMN IF NOT EXISTS extra_image_paths text[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.create_item(_seller_id uuid, _seller_key uuid, _title text, _price numeric, _category text, _image_path text, _description text DEFAULT NULL::text, _state text DEFAULT NULL::text, _city text DEFAULT NULL::text, _extra_image_paths text[] DEFAULT '{}')
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _id uuid;
  _clean_title text := btrim(coalesce(_title, ''));
  _clean_category text := btrim(coalesce(_category, ''));
  _extra text[] := coalesce(_extra_image_paths, '{}');
  _p text;
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
  IF array_length(_extra, 1) > 2 THEN
    RAISE EXCEPTION 'Too many photos';
  END IF;
  FOREACH _p IN ARRAY _extra LOOP
    IF _p !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|heic|heif|gif)$' THEN
      RAISE EXCEPTION 'Invalid image';
    END IF;
  END LOOP;
  IF _description IS NOT NULL AND length(_description) > 500 THEN
    RAISE EXCEPTION 'Description too long';
  END IF;

  INSERT INTO public.items (seller_id, title, price, category, description, image_path, extra_image_paths, location_state, location_city)
  VALUES (
    _seller_id,
    _clean_title,
    _price,
    _clean_category,
    nullif(btrim(coalesce(_description, '')), ''),
    _image_path,
    _extra,
    nullif(btrim(coalesce(_state, '')), ''),
    nullif(btrim(coalesce(_city, '')), '')
  )
  RETURNING id INTO _id;

  RETURN _id;
END;
$function$;