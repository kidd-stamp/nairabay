import { createFileRoute } from "@tanstack/react-router";

type InboundPayload = {
  from?: unknown;
  text?: unknown;
  message?: unknown;
  body?: unknown;
  sender?: unknown;
};

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export const Route = createFileRoute("/api/public/sms-inbound")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["SMS_INBOUND_SECRET"];
        if (!secret) return new Response("Server not configured", { status: 500 });

        const provided =
          request.headers.get("x-sms-secret") ??
          (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
        if (provided !== secret) return new Response("Unauthorized", { status: 401 });

        let payload: InboundPayload;
        try {
          payload = (await request.json()) as InboundPayload;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const from = pickString(payload.from, payload.sender);
        const text = pickString(payload.text, payload.message, payload.body);
        if (!from || !text) return new Response("Missing from/text", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.rpc("verify_phone_from_sms", {
          _from: from,
          _body: text,
        });
        if (error) return new Response("Verification failed", { status: 500 });

        const rows = (data ?? []) as { bay_handle: string }[];
        return Response.json({
          verified: rows.length > 0,
          bay_handles: rows.map((r) => r.bay_handle),
        });
      },
    },
  },
});
