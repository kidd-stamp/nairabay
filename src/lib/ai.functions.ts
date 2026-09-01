import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CATEGORIES } from "@/lib/nairabay";

const inputSchema = z.object({
  // data:image/...;base64,... of the seller's photo
  imageDataUrl: z.string().startsWith("data:image/").max(9_000_000),
});

export type PhotoSuggestion = {
  item_category: string;
  suggested_title: string;
  estimated_condition: string;
  suggested_description: string;
};

/**
 * Vision auto-fill: seller snaps a photo, the model returns category, title,
 * condition and a short description so they barely have to type.
 */
export const analyzeListingPhoto = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<PhotoSuggestion | { error: string }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { error: "AI is not configured." };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "You label second-hand marketplace photos for Nigerian sellers. Reply with JSON only.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  `Look at this item for sale and return strict JSON: ` +
                  `{"item_category": one of ${JSON.stringify(CATEGORIES)}, ` +
                  `"suggested_title": short listing title under 60 chars (brand + model if visible), ` +
                  `"estimated_condition": one of "Brand New","Fairly Used","Used","Needs Repair", ` +
                  `"suggested_description": one plain sentence a buyer would find useful}. ` +
                  `Describe only the single main item for sale. Return one JSON object, not an array. No markdown.`,
              },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return { error: "AI is busy right now — fill the details yourself." };
      if (res.status === 402) return { error: "AI credits are exhausted for this workspace." };
      return { error: "Couldn't read that photo — fill the details yourself." };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content ?? "";
    try {
      const parsed = JSON.parse(raw.replace(/^```(?:json)?|```$/g, "").trim()) as PhotoSuggestion;
      const category = CATEGORIES.includes(parsed.item_category as (typeof CATEGORIES)[number])
        ? parsed.item_category
        : "Other";
      return {
        item_category: category,
        suggested_title: String(parsed.suggested_title ?? "").slice(0, 100),
        estimated_condition: String(parsed.estimated_condition ?? ""),
        suggested_description: String(parsed.suggested_description ?? "").slice(0, 300),
      };
    } catch {
      return { error: "Couldn't read that photo — fill the details yourself." };
    }
  });
