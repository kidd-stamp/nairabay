-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Admin: reports
CREATE OR REPLACE FUNCTION public.admin_list_reports(_status text DEFAULT NULL)
RETURNS TABLE(
  id uuid, reason text, details text, status text, created_at timestamptz,
  seller_id uuid, bay_handle text, phone_verified_at timestamptz,
  item_id uuid, item_title text, item_status text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT r.id, r.reason, r.details, r.status, r.created_at,
         s.id, s.bay_handle, s.phone_verified_at,
         i.id, i.title, i.status
  FROM public.reports r
  JOIN public.sellers s ON s.id = r.seller_id
  LEFT JOIN public.items i ON i.id = r.item_id
  WHERE _status IS NULL OR r.status = _status
  ORDER BY r.created_at DESC
  LIMIT 200;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_report_status(_report_id uuid, _status text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _count int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _status NOT IN ('open', 'reviewing', 'resolved', 'dismissed') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  UPDATE public.reports SET status = _status WHERE id = _report_id;
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count > 0;
END;
$$;

-- Admin: sellers
CREATE OR REPLACE FUNCTION public.admin_list_sellers(_search text DEFAULT NULL)
RETURNS TABLE(
  id uuid, bay_handle text, display_name text, phone_number text,
  location_state text, location_city text,
  phone_verified_at timestamptz, created_at timestamptz, item_count bigint
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT s.id, s.bay_handle, s.display_name, s.phone_number,
         s.location_state, s.location_city, s.phone_verified_at, s.created_at,
         (SELECT count(*) FROM public.items i WHERE i.seller_id = s.id)
  FROM public.sellers s
  WHERE _search IS NULL OR btrim(_search) = ''
     OR s.bay_handle ILIKE '%' || btrim(_search) || '%'
     OR s.phone_number ILIKE '%' || btrim(_search) || '%'
     OR coalesce(s.display_name, '') ILIKE '%' || btrim(_search) || '%'
  ORDER BY s.created_at DESC
  LIMIT 200;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_seller_verified(_seller_id uuid, _verified boolean)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _count int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.sellers
  SET phone_verified_at = CASE WHEN _verified THEN coalesce(phone_verified_at, now()) ELSE NULL END
  WHERE id = _seller_id;
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count > 0;
END;
$$;

-- Admin: listings
CREATE OR REPLACE FUNCTION public.admin_list_items(_status text DEFAULT NULL, _search text DEFAULT NULL)
RETURNS TABLE(
  id uuid, title text, price numeric, category text, description text,
  image_path text, location_state text, location_city text, status text,
  views int, created_at timestamptz, seller_id uuid, bay_handle text,
  phone_verified_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT i.id, i.title, i.price, i.category, i.description, i.image_path,
         i.location_state, i.location_city, i.status, i.views, i.created_at,
         s.id, s.bay_handle, s.phone_verified_at
  FROM public.items i
  JOIN public.sellers s ON s.id = i.seller_id
  WHERE (_status IS NULL OR i.status = _status)
    AND (_search IS NULL OR btrim(_search) = ''
         OR i.title ILIKE '%' || btrim(_search) || '%'
         OR s.bay_handle ILIKE '%' || btrim(_search) || '%')
  ORDER BY i.created_at DESC
  LIMIT 200;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_item_status(_item_id uuid, _status text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _count int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _status NOT IN ('active', 'sold', 'removed') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  UPDATE public.items SET status = _status WHERE id = _item_id;
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS TABLE(open_reports bigint, unverified_sellers bigint, active_items bigint, sellers_total bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT (SELECT count(*) FROM public.reports WHERE status = 'open'),
         (SELECT count(*) FROM public.sellers WHERE phone_verified_at IS NULL),
         (SELECT count(*) FROM public.items WHERE status = 'active'),
         (SELECT count(*) FROM public.sellers);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_reports(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_report_status(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_sellers(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_seller_verified(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_items(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_item_status(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_stats() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_list_reports(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_set_report_status(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_list_sellers(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_set_seller_verified(uuid, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_list_items(text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_set_item_status(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated, service_role;