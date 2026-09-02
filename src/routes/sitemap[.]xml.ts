import { createFileRoute } from "@tanstack/react-router";
import { STATES, placesForState } from "@/lib/locations";

const SITE = "https://www.nairabay.com";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls: string[] = ["/", "/post", "/rules", "/sell-safely", "/faq", "/nigeria"];
        for (const state of STATES) {
          urls.push(`/nigeria/${state.slug}`);
          for (const place of placesForState(state)) {
            urls.push(`/nigeria/${state.slug}/${place.slug}`);
          }
        }
        const body =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls
            .map(
              (u) =>
                `  <url><loc>${SITE}${u}</loc><changefreq>daily</changefreq><priority>${u === "/" ? "1.0" : "0.7"}</priority></url>`,
            )
            .join("\n") +
          `\n</urlset>\n`;
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
