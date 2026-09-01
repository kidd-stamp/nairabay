-- Guests (non-sellers) who want to message a seller
CREATE TABLE public.chat_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL UNIQUE,
  handle text NOT NULL UNIQUE,
  city text,
  chat_key uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.chat_users TO service_role;
ALTER TABLE public.chat_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct chat_users access" ON public.chat_users
  AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  buyer_party_id uuid NOT NULL,
  buyer_kind text NOT NULL CHECK (buyer_kind IN ('seller', 'guest')),
  buyer_handle text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, buyer_party_id)
);
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct conversation access" ON public.conversations
  AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_role text NOT NULL CHECK (sender_role IN ('buyer', 'seller')),
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_conversation_idx ON public.chat_messages (conversation_id, created_at);
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct message access" ON public.chat_messages
  AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- Returns 'seller' | 'guest' | NULL for a party id + private device key
CREATE OR REPLACE FUNCTION public.chat_party_kind(_party_id uuid, _chat_key uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = _party_id AND s.seller_key = _chat_key) THEN 'seller'
    WHEN EXISTS (SELECT 1 FROM public.chat_users c WHERE c.id = _party_id AND c.chat_key = _chat_key) THEN 'guest'
    ELSE NULL
  END;
$$;

-- Claim a chat identity from a phone number. Existing sellers keep their Bay#.
CREATE OR REPLACE FUNCTION public.chat_claim_identity(_phone text, _city text DEFAULT NULL)
RETURNS TABLE(party_id uuid, handle text, chat_key uuid, kind text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _digits text;
  _clean_city text;
  _base text;
  _candidate text;
  _n int := 1;
  _seller public.sellers%ROWTYPE;
  _guest public.chat_users%ROWTYPE;
BEGIN
  _digits := regexp_replace(coalesce(_phone, ''), '[^0-9]', '', 'g');
  IF length(_digits) < 7 OR length(_digits) > 15 THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;

  SELECT * INTO _seller FROM public.sellers s WHERE s.phone_number = _digits;
  IF FOUND THEN
    RETURN QUERY SELECT _seller.id, _seller.bay_handle, _seller.seller_key, 'seller'::text;
    RETURN;
  END IF;

  SELECT * INTO _guest FROM public.chat_users c WHERE c.phone_number = _digits;
  IF FOUND THEN
    RETURN QUERY SELECT _guest.id, _guest.handle, _guest.chat_key, 'guest'::text;
    RETURN;
  END IF;

  _clean_city := regexp_replace(btrim(coalesce(_city, '')), '[^A-Za-z]', '', 'g');
  IF _clean_city = '' THEN _clean_city := 'Bay'; END IF;
  _clean_city := left(_clean_city, 20);
  _base := initcap(lower(_clean_city)) || right(_digits, 4);
  _candidate := _base;
  WHILE EXISTS (SELECT 1 FROM public.chat_users c WHERE c.handle = _candidate)
     OR EXISTS (SELECT 1 FROM public.sellers s WHERE s.bay_handle = _candidate) LOOP
    _n := _n + 1;
    _candidate := _base || '-' || _n;
  END LOOP;

  INSERT INTO public.chat_users (phone_number, handle, city)
  VALUES (_digits, _candidate, nullif(btrim(coalesce(_city, '')), ''))
  RETURNING * INTO _guest;

  RETURN QUERY SELECT _guest.id, _guest.handle, _guest.chat_key, 'guest'::text;
END;
$$;

-- Open (or reuse) the thread between this party and a listing's seller
CREATE OR REPLACE FUNCTION public.chat_open_conversation(_item_id uuid, _party_id uuid, _chat_key uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _kind text;
  _seller_id uuid;
  _handle text;
  _conv_id uuid;
BEGIN
  _kind := public.chat_party_kind(_party_id, _chat_key);
  IF _kind IS NULL THEN RAISE EXCEPTION 'Not authorized'; END IF;

  SELECT i.seller_id INTO _seller_id FROM public.items i WHERE i.id = _item_id;
  IF _seller_id IS NULL THEN RAISE EXCEPTION 'Unknown listing'; END IF;
  IF _seller_id = _party_id THEN RAISE EXCEPTION 'You cannot chat yourself'; END IF;

  SELECT c.id INTO _conv_id FROM public.conversations c
  WHERE c.item_id = _item_id AND c.buyer_party_id = _party_id;
  IF _conv_id IS NOT NULL THEN RETURN _conv_id; END IF;

  IF _kind = 'seller' THEN
    SELECT s.bay_handle INTO _handle FROM public.sellers s WHERE s.id = _party_id;
  ELSE
    SELECT c.handle INTO _handle FROM public.chat_users c WHERE c.id = _party_id;
  END IF;

  INSERT INTO public.conversations (item_id, seller_id, buyer_party_id, buyer_kind, buyer_handle)
  VALUES (_item_id, _seller_id, _party_id, _kind, _handle)
  RETURNING id INTO _conv_id;

  RETURN _conv_id;
END;
$$;

-- 'buyer' | 'seller' | NULL: which side of a conversation this party is on
CREATE OR REPLACE FUNCTION public.chat_role_in(_conversation_id uuid, _party_id uuid, _chat_key uuid)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _conv public.conversations%ROWTYPE;
BEGIN
  IF public.chat_party_kind(_party_id, _chat_key) IS NULL THEN RETURN NULL; END IF;
  SELECT * INTO _conv FROM public.conversations c WHERE c.id = _conversation_id;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF _conv.buyer_party_id = _party_id THEN RETURN 'buyer'; END IF;
  IF _conv.seller_id = _party_id THEN RETURN 'seller'; END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.chat_send(_conversation_id uuid, _party_id uuid, _chat_key uuid, _body text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _role text;
  _clean text := btrim(coalesce(_body, ''));
  _id uuid;
BEGIN
  _role := public.chat_role_in(_conversation_id, _party_id, _chat_key);
  IF _role IS NULL THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF length(_clean) < 1 OR length(_clean) > 1000 THEN RAISE EXCEPTION 'Message must be 1-1000 characters'; END IF;

  INSERT INTO public.chat_messages (conversation_id, sender_role, body)
  VALUES (_conversation_id, _role, _clean)
  RETURNING id INTO _id;

  UPDATE public.conversations SET last_message_at = now() WHERE id = _conversation_id;
  RETURN _id;
END;
$$;

-- Fetch a thread and mark the other side's messages as read
CREATE OR REPLACE FUNCTION public.chat_thread(_conversation_id uuid, _party_id uuid, _chat_key uuid)
RETURNS TABLE(id uuid, sender_role text, body text, created_at timestamptz, mine boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _role text;
BEGIN
  _role := public.chat_role_in(_conversation_id, _party_id, _chat_key);
  IF _role IS NULL THEN RAISE EXCEPTION 'Not authorized'; END IF;

  UPDATE public.chat_messages m SET read_at = now()
  WHERE m.conversation_id = _conversation_id AND m.sender_role <> _role AND m.read_at IS NULL;

  RETURN QUERY
  SELECT m.id, m.sender_role, m.body, m.created_at, (m.sender_role = _role)
  FROM public.chat_messages m
  WHERE m.conversation_id = _conversation_id
  ORDER BY m.created_at ASC
  LIMIT 500;
END;
$$;

-- Inbox: every thread this party is part of, buying or selling
CREATE OR REPLACE FUNCTION public.chat_inbox(_party_id uuid, _chat_key uuid)
RETURNS TABLE(id uuid, item_id uuid, item_title text, item_image_path text, my_role text,
              other_handle text, last_body text, last_message_at timestamptz, unread bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF public.chat_party_kind(_party_id, _chat_key) IS NULL THEN RAISE EXCEPTION 'Not authorized'; END IF;

  RETURN QUERY
  SELECT c.id, i.id, i.title, i.image_path,
         CASE WHEN c.seller_id = _party_id THEN 'seller' ELSE 'buyer' END,
         CASE WHEN c.seller_id = _party_id THEN c.buyer_handle ELSE s.bay_handle END,
         (SELECT m.body FROM public.chat_messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1),
         c.last_message_at,
         (SELECT count(*) FROM public.chat_messages m
          WHERE m.conversation_id = c.id AND m.read_at IS NULL
            AND m.sender_role <> (CASE WHEN c.seller_id = _party_id THEN 'seller' ELSE 'buyer' END))
  FROM public.conversations c
  JOIN public.items i ON i.id = c.item_id
  JOIN public.sellers s ON s.id = c.seller_id
  WHERE c.seller_id = _party_id OR c.buyer_party_id = _party_id
  ORDER BY c.last_message_at DESC
  LIMIT 100;
END;
$$;

CREATE OR REPLACE FUNCTION public.chat_unread_count(_party_id uuid, _chat_key uuid)
RETURNS bigint LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _total bigint;
BEGIN
  IF public.chat_party_kind(_party_id, _chat_key) IS NULL THEN RETURN 0; END IF;
  SELECT count(*) INTO _total
  FROM public.chat_messages m
  JOIN public.conversations c ON c.id = m.conversation_id
  WHERE m.read_at IS NULL
    AND ((c.seller_id = _party_id AND m.sender_role = 'buyer')
      OR (c.buyer_party_id = _party_id AND m.sender_role = 'seller'));
  RETURN coalesce(_total, 0);
END;
$$;