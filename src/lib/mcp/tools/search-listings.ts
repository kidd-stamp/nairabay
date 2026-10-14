import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { SITE, supabaseAnon } from "../supabase";

export default defineTool({
  name: "search_listings",
  title: "Search listings",
  description: "Search active Nairabay listings by keyword, category, state or city.",
  inputSchema: {
    query: z.string().max(100).optional().describe("Words to match in the listing title."),
    category: z.string().max(50).optional().describe("Category name, e.g. Phones."),
    state: z.string().max(50).optional().describe("Nigerian state, e.g. Lagos."),
    city: z.string().max(50).optional().describe("City or area."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, state, city, limit }) => {
    let q = supabaseAnon()
      .from("items")
      .select("id, title, price, category, location_state, location_city, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (query) q = q.ilike("title", `%${query}%`);
    if (category) q = q.eq("category", category);
    if (state) q = q.eq("location_state", state);
    if (city) q = q.ilike("location_city", `%${city}%`);
    const { data, error } = await q;
    if (error) throw new ToolError("Could not search listings right now.");
    const listings = (data ?? []).map((r) => ({
      id: String(r.id),
      title: String(r.title),
      price: Number(r.price),
      category: String(r.category ?? ""),
      state: r.location_state ? String(r.location_state) : null,
      city: r.location_city ? String(r.location_city) : null,
      url: `${SITE}/item/${r.id}`,
    }));
    const text = listings.length
      ? listings.map((l) => `${l.title} — ₦${l.price} (${l.city ?? l.state ?? "Nigeria"}) ${l.url}`).join("\n")
      : "No listings found.";
    return { content: [{ type: "text", text }], structuredContent: { listings } };
  },
});
