import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { SITE, supabaseAnon } from "../supabase";

export default defineTool({
  name: "get_listing",
  title: "Get listing",
  description: "Get details of one Nairabay listing, including the seller's Bay# and verification.",
  inputSchema: { id: z.string().uuid().describe("Listing ID.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }) => {
    const { data, error } = await supabaseAnon()
      .from("items")
      .select("id, title, price, category, description, location_state, location_city, status, created_at, seller:sellers(bay_handle, phone_verified_at)")
      .eq("id", id)
      .neq("status", "removed")
      .maybeSingle();
    if (error) throw new ToolError("Could not load listing.");
    if (!data) throw new ToolError("Listing not found.");
    const seller = (Array.isArray(data.seller) ? data.seller[0] : data.seller) as
      | { bay_handle: string; phone_verified_at: string | null }
      | null;
    const listing = {
      id: String(data.id),
      title: String(data.title),
      price: Number(data.price),
      category: String(data.category ?? ""),
      description: data.description ? String(data.description) : null,
      state: data.location_state ? String(data.location_state) : null,
      city: data.location_city ? String(data.location_city) : null,
      status: String(data.status),
      posted_at: String(data.created_at),
      bay_handle: seller?.bay_handle ?? null,
      seller_verified: Boolean(seller?.phone_verified_at),
      url: `${SITE}/item/${data.id}`,
    };
    const text = `${listing.title} — ₦${listing.price}\n${listing.description ?? ""}\nSeller: ${listing.bay_handle ?? "?"}${listing.seller_verified ? " (verified)" : ""}\n${listing.url}`;
    return { content: [{ type: "text", text }], structuredContent: { listing } };
  },
});
