DROP VIEW public.sellers_public;

GRANT SELECT (id, phone_number, bay_handle, display_name, location_state, location_city, created_at)
  ON public.sellers TO anon, authenticated;

CREATE POLICY "Public can view seller profiles" ON public.sellers
  FOR SELECT TO anon, authenticated USING (true);