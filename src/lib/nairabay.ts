import { supabase } from "@/integrations/supabase/client";

export const CATEGORIES = [
  "Fashion",
  "Footwear",
  "Phones & Gadgets",
  "Electronics",
  "Home & Furniture",
  "Beauty",
  "Books",
  "Vehicles",
  "Real Estate",
  "Services",
  "Food & Groceries",
  "Other",
] as const;

export const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
  "Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina",
  "Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers",
  "Sokoto","Taraba","Yobe","Zamfara","Outside Nigeria",
];

export type BaySession = {
  sellerId: string;
  bayHandle: string;
  sellerKey: string;
  phone: string;
};

const SESSION_KEY = "nairabay.session.v1";

export function loadSession(): BaySession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as BaySession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: BaySession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function formatNaira(amount: number) {
  return "₦" + new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(amount);
}

export function digitsOnly(phone: string) {
  return phone.replace(/[^0-9]/g, "");
}

/** Normalises a local or international number to digits and previews the bay handle. */
export function previewBayHandle(phone: string) {
  const digits = digitsOnly(phone);
  if (digits.length < 7) return null;
  return "bay" + digits.slice(-4);
}

export function whatsappLink(phoneDigits: string, message: string) {
  let intl = phoneDigits;
  if (intl.startsWith("0")) intl = "234" + intl.slice(1);
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function isFreshAccount(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

/** The dedicated NairaBay SIM that receives verification texts. */
export const VERIFY_NUMBER = "+234 808 742 2887";
export const VERIFY_KEYWORD = "VERIFY";
/** Hours a brand-new listing stays live while the seller verifies by SMS. */
export const VERIFY_GRACE_HOURS = 24;

export function verifySmsLink() {
  const digits = VERIFY_NUMBER.replace(/[^0-9+]/g, "");
  return `sms:${digits}?&body=${encodeURIComponent(VERIFY_KEYWORD)}`;
}

export function hoursLeftToVerify(createdAt: string) {
  const ms = new Date(createdAt).getTime() + VERIFY_GRACE_HOURS * 3600_000 - Date.now();
  return Math.max(0, Math.ceil(ms / 3600_000));
}

export type Seller = {
  id: string;
  phone_number: string;
  bay_handle: string;
  display_name: string | null;
  location_state: string | null;
  location_city: string | null;
  phone_verified_at: string | null;
  created_at: string;
};

export type Item = {
  id: string;
  seller_id: string;
  title: string;
  price: number;
  category: string;
  description: string | null;
  image_path: string;
  location_state: string | null;
  location_city: string | null;
  status: string;
  views: number;
  created_at: string;
  seller?: Seller | null;
};

const SELLER_COLUMNS =
  "id, phone_number, bay_handle, display_name, location_state, location_city, phone_verified_at, created_at";

/** Poll the seller row to see whether their VERIFY text has landed. */
export async function fetchSellerVerification(sellerId: string) {
  const { data, error } = await supabase
    .from("sellers")
    .select("phone_verified_at, bay_handle")
    .eq("id", sellerId)
    .maybeSingle();
  if (error) throw error;
  return {
    verified: Boolean(data?.phone_verified_at),
    bayHandle: (data?.bay_handle as string | undefined) ?? "",
  };
}

export async function signedImageUrl(path: string) {
  const { data } = await supabase.storage.from("item-photos").createSignedUrl(path, 60 * 60 * 24);
  return data?.signedUrl ?? "";
}

export async function signedImageUrls(paths: string[]) {
  if (paths.length === 0) return {} as Record<string, string>;
  const { data } = await supabase.storage
    .from("item-photos")
    .createSignedUrls(Array.from(new Set(paths)), 60 * 60 * 24);
  const map: Record<string, string> = {};
  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl) map[entry.path] = entry.signedUrl;
  }
  return map;
}

export async function fetchItems(opts: { category?: string | undefined; search?: string | undefined; state?: string | undefined } = {}) {
  let query = supabase
    .from("items")
    .select(`id, seller_id, title, price, category, description, image_path, location_state, location_city, status, views, created_at, seller:sellers(${SELLER_COLUMNS})`)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(60);

  if (opts.category) query = query.eq("category", opts.category);
  if (opts.state) query = query.eq("location_state", opts.state);
  if (opts.search) query = query.ilike("title", `%${opts.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Item[];
}

export async function fetchItem(id: string) {
  const { data, error } = await supabase
    .from("items")
    .select(`id, seller_id, title, price, category, description, image_path, location_state, location_city, status, views, created_at, seller:sellers(${SELLER_COLUMNS})`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as Item) ?? null;
}

export async function fetchBay(handle: string) {
  const { data: seller, error } = await supabase
    .from("sellers")
    .select(SELLER_COLUMNS)
    .eq("bay_handle", handle)
    .maybeSingle();
  if (error) throw error;
  if (!seller) return null;

  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select("id, seller_id, title, price, category, description, image_path, location_state, location_city, status, views, created_at")
    .eq("seller_id", (seller as Seller).id)
    .neq("status", "removed")
    .order("created_at", { ascending: false });
  if (itemsError) throw itemsError;

  return { seller: seller as Seller, items: (items ?? []) as unknown as Item[] };
}

export async function claimBay(input: {
  phone: string;
  displayName?: string | undefined;
  state?: string | undefined;
  city?: string | undefined;
}): Promise<BaySession> {
  const digits = digitsOnly(input.phone);
  const { data, error } = await supabase.rpc("claim_bay", {
    _phone: digits,
    ...(input.displayName ? { _display_name: input.displayName } : {}),
    ...(input.state ? { _state: input.state } : {}),
    ...(input.city ? { _city: input.city } : {}),
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Could not create your Bay#");
  const session: BaySession = {
    sellerId: row.seller_id as string,
    bayHandle: row.bay_handle as string,
    sellerKey: row.seller_key as string,
    phone: digits,
  };
  saveSession(session);
  return session;
}

/** Swap the phone number on an existing bay and restart verification. */
export async function updateSellerPhone(session: BaySession, phone: string): Promise<BaySession> {
  const digits = digitsOnly(phone);
  const { data, error } = await supabase.rpc("update_seller_phone", {
    _seller_id: session.sellerId,
    _seller_key: session.sellerKey,
    _phone: digits,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Could not update your number");
  return {
    ...session,
    bayHandle: row.bay_handle as string,
    phone: (row.phone_number as string) ?? digits,
  };
}

export async function uploadPhoto(file: File) {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("item-photos").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || "image/jpeg",
  });
  if (error) throw error;
  return path;
}

export async function createItem(input: {
  sellerId: string;
  title: string;
  price: number;
  category: string;
  description?: string | undefined;
  imagePath: string;
  state?: string | undefined;
  city?: string | undefined;
}) {
  const { data, error } = await supabase
    .from("items")
    .insert({
      seller_id: input.sellerId,
      title: input.title,
      price: input.price,
      category: input.category,
      description: input.description ?? null,
      image_path: input.imagePath,
      location_state: input.state ?? null,
      location_city: input.city ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function setItemStatus(itemId: string, sellerKey: string, status: "active" | "sold" | "removed") {
  const { data, error } = await supabase.rpc("set_item_status", {
    _item_id: itemId,
    _seller_key: sellerKey,
    _status: status,
  });
  if (error) throw error;
  return Boolean(data);
}

export async function bumpViews(itemId: string) {
  await supabase.rpc("bump_item_views", { _item_id: itemId });
}

/** Reverse geocode the browser position into a Nigerian state/city label. */
export async function detectLocation(): Promise<{ state: string; city: string }> {
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("Location not supported"));
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
  });
  const { latitude, longitude } = position.coords;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
  );
  if (!res.ok) throw new Error("Could not detect your location");
  const json = (await res.json()) as { address?: Record<string, string> };
  const address = json.address ?? {};
  const rawState = (address["state"] ?? "").replace(/ State$/i, "").trim();
  const state: string =
    NIGERIAN_STATES.find((s) => s.toLowerCase().includes(rawState.toLowerCase()) && rawState) ??
    (address["country"] === "Nigeria" ? rawState : "Outside Nigeria");
  const city =
    address["city"] ?? address["town"] ?? address["suburb"] ?? address["village"] ?? address["county"] ?? "";
  return { state: state || "", city };
}
