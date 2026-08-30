import { Link } from "@tanstack/react-router";
import { formatNaira, timeAgo, type Item } from "@/lib/nairabay";

export function ItemCard({ item, imageUrl }: { item: Item; imageUrl?: string | undefined }) {
  return (
    <Link
      to="/item/$id"
      params={{ id: item.id }}
      className="surface-card group block overflow-hidden transition-shadow hover:shadow-lift"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full animate-pulse bg-muted" />
        )}
        {item.status === "sold" ? (
          <span className="absolute left-2 top-2 rounded-full bg-foreground/85 px-3 py-1 text-xs font-bold text-background">
            SOLD
          </span>
        ) : null}
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-1 text-sm font-semibold">{item.title}</p>
        <p className="font-display text-xl text-primary">{formatNaira(Number(item.price))}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          📍 {item.location_city || item.location_state || "Nigeria"} · {timeAgo(item.created_at)}
        </p>
      </div>
    </Link>
  );
}
