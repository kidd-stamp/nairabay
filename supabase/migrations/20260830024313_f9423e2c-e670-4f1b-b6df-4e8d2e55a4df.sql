-- 1. Hide seller_key (and lock writes) via column-level + command-level grants
REVOKE ALL ON public.sellers FROM anon, authenticated;
GRANT SELECT (id, phone_number, bay_handle, display_name, location_state, location_city, phone_verified_at, created_at)
  ON public.sellers TO anon, authenticated;
GRANT ALL ON public.sellers TO service_role;

DROP POLICY IF EXISTS "Anyone can create a seller" ON public.sellers;

-- explicit deny for update/delete on sellers
DROP POLICY IF EXISTS "No direct seller updates" ON public.sellers;
CREATE POLICY "No direct seller updates" ON public.sellers
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false);
DROP POLICY IF EXISTS "No direct seller deletes" ON public.sellers;
CREATE POLICY "No direct seller deletes" ON public.sellers
  AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);

-- 2. Items: keep public read + insert, explicitly deny update/delete
REVOKE UPDATE, DELETE, TRUNCATE ON public.items FROM anon, authenticated;
GRANT SELECT, INSERT ON public.items TO anon, authenticated;
GRANT ALL ON public.items TO service_role;

DROP POLICY IF EXISTS "No direct item updates" ON public.items;
CREATE POLICY "No direct item updates" ON public.items
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false);
DROP POLICY IF EXISTS "No direct item deletes" ON public.items;
CREATE POLICY "No direct item deletes" ON public.items
  AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);

-- 3. Storage: constrain uploads, block overwrite/delete
DROP POLICY IF EXISTS "Anyone can upload item photos" ON storage.objects;
CREATE POLICY "Item photo uploads must use generated names" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'item-photos'
    AND array_length(string_to_array(name, '/'), 1) = 1
    AND name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|heic|heif|gif)$'
  );

DROP POLICY IF EXISTS "No item photo overwrite" ON storage.objects;
CREATE POLICY "No item photo overwrite" ON storage.objects
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (bucket_id <> 'item-photos');

DROP POLICY IF EXISTS "No item photo deletes" ON storage.objects;
CREATE POLICY "No item photo deletes" ON storage.objects
  AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (bucket_id <> 'item-photos');

-- 4. SECURITY DEFINER exposure: only the server may run the SMS verification routine
REVOKE ALL ON FUNCTION public.verify_phone_from_sms(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_phone_from_sms(text, text) TO service_role;

-- item_is_visible is only meaningful inside the items RLS policy
REVOKE ALL ON FUNCTION public.item_is_visible(uuid, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.item_is_visible(uuid, timestamptz) TO postgres, service_role;

-- keep the key-protected app RPCs callable, but nothing broader
REVOKE ALL ON FUNCTION public.claim_bay(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_bay(text, text, text, text) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.set_item_status(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_item_status(uuid, uuid, text) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.update_seller_phone(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_seller_phone(uuid, uuid, text) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.bump_item_views(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bump_item_views(uuid) TO anon, authenticated, service_role;