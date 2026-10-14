import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { SITE, supabaseAnon } from "../supabase";

export default defineTool({
  name: "get_bay",
  title: "Get seller Bay#",
  description: "Get a seller's public Bay# page: verification status and their active listings.",
  inputSchema: { handle: z.string().min(2).max(40).describe("Bay# handle, e.g. bay2342.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ handle }) => {
    const db = supabaseAnon();
    const { data: seller, error } = await db
      .from("sellers")
      .select("id, bay_handle, location_state, location_city, phone_verified_at, created_at")
      .eq("bay_handle", handle.trim().toLowerCase())
      .maybeSingle();
    if (error) throw new ToolError("Could not load Bay#.");
    if (!seller) throw new ToolError("Bay# not found.");
    const { data: items } = await db
      .from("items")
      .select("id, title, price")
      .eq("seller_id", seller.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(50);
    const bay = {
      handle: String(seller.bay_handle),
      verified: Boolean(seller.phone_verified_at),
      state: seller.location_state ? String(seller.location_state) : null,
      joined: String(seller.created_at),
      url: `${SITE}/bay/${seller.bay_handle}`,
      listings: (items ?? []).map((i) => ({
        id: String(i.id),
        title: String(i.title),
        price: Number(i.price),
        url: `${SITE}/item/${i.id}`,
      })),
    };
    const text = `${bay.handle}${bay.verified ? " (verified)" : " (unverified)"} — ${bay.listings.length} active listings\n${bay.listings.map((l) => `${l.title} — ₦${l.price} ${l.url}`).join("\n")}`;
    return { content: [{ type: "text", text }], structuredContent: { bay } };
  },
});
