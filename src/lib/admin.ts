import { supabase } from "@/integrations/supabase/client";

export type AdminReport = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  seller_id: string;
  bay_handle: string;
  phone_verified_at: string | null;
  item_id: string | null;
  item_title: string | null;
  item_status: string | null;
};

export type AdminSeller = {
  id: string;
  bay_handle: string;
  display_name: string | null;
  phone_number: string;
  location_state: string | null;
  location_city: string | null;
  phone_verified_at: string | null;
  created_at: string;
  item_count: number;
};

export type AdminItem = {
  id: string;
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
  seller_id: string;
  bay_handle: string;
  phone_verified_at: string | null;
};

export type AdminStats = {
  open_reports: number;
  unverified_sellers: number;
  active_items: number;
  sellers_total: number;
};

export const REPORT_STATUSES = ["open", "reviewing", "resolved", "dismissed"] as const;
export const ITEM_STATUSES = ["active", "sold", "removed"] as const;

export async function isAdmin(userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) return false;
  return Boolean(data);
}

export async function fetchAdminStats() {
  const { data, error } = await supabase.rpc("admin_stats");
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as AdminStats | undefined;
  return (
    row ?? { open_reports: 0, unverified_sellers: 0, active_items: 0, sellers_total: 0 }
  );
}

export async function fetchAdminReports(status?: string) {
  const { data, error } = await supabase.rpc("admin_list_reports", {
    ...(status ? { _status: status } : {}),
  });
  if (error) throw error;
  return (data ?? []) as unknown as AdminReport[];
}

export async function setReportStatus(reportId: string, status: string) {
  const { error } = await supabase.rpc("admin_set_report_status", {
    _report_id: reportId,
    _status: status,
  });
  if (error) throw error;
}

export async function fetchAdminSellers(search?: string) {
  const { data, error } = await supabase.rpc("admin_list_sellers", {
    ...(search ? { _search: search } : {}),
  });
  if (error) throw error;
  return (data ?? []) as unknown as AdminSeller[];
}

export async function setSellerVerified(sellerId: string, verified: boolean) {
  const { error } = await supabase.rpc("admin_set_seller_verified", {
    _seller_id: sellerId,
    _verified: verified,
  });
  if (error) throw error;
}

export async function fetchAdminItems(opts: { status?: string; search?: string } = {}) {
  const { data, error } = await supabase.rpc("admin_list_items", {
    ...(opts.status ? { _status: opts.status } : {}),
    ...(opts.search ? { _search: opts.search } : {}),
  });
  if (error) throw error;
  return (data ?? []) as unknown as AdminItem[];
}

export async function adminSetItemStatus(itemId: string, status: string) {
  const { error } = await supabase.rpc("admin_set_item_status", {
    _item_id: itemId,
    _status: status,
  });
  if (error) throw error;
}
