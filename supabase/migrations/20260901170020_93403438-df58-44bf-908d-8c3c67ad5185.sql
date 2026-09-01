DROP FUNCTION IF EXISTS public.admin_list_items(text, text);

CREATE OR REPLACE FUNCTION public.admin_list_items(_status text DEFAULT NULL::text, _search text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, title text, price numeric, category text, description text, image_path text, location_state text, location_city text, status text, views integer, created_at timestamp with time zone, seller_id uuid, bay_handle text, phone_verified_at timestamp with time zone, phone_number text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT i.id, i.title, i.price, i.category, i.description, i.image_path,
         i.location_state, i.location_city, i.status, i.views, i.created_at,
         s.id, s.bay_handle, s.phone_verified_at, s.phone_number
  FROM public.items i
  JOIN public.sellers s ON s.id = i.seller_id
  WHERE (_status IS NULL OR i.status = _status)
    AND (_search IS NULL OR btrim(_search) = ''
         OR i.title ILIKE '%' || btrim(_search) || '%'
         OR s.bay_handle ILIKE '%' || btrim(_search) || '%'
         OR s.phone_number ILIKE '%' || btrim(_search) || '%')
  ORDER BY i.created_at DESC
  LIMIT 200;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_list_items(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_items(text, text) TO authenticated, service_role;