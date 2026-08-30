import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ItemCard } from "@/components/nairabay/ItemCard";
import { fetchItems, signedImageUrls } from "@/lib/nairabay";

export function LocationFeed({ state, city }: { state: string; city?: string | undefined }) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items", "location", state, city ?? ""],
    queryFn: () => fetchItems({ state, city: city || undefined }),
  });

  const paths = useMemo(() => items.map((i) => i.image_path), [items]);
  const { data: urls = {} } = useQuery({
    queryKey: ["item-images", paths],
    queryFn: () => signedImageUrls(paths),
    enabled: paths.length > 0,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-card h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="surface-card p-8 text-center">
        <p className="font-display text-3xl">No listings here yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Be the first seller in {city ?? state}. Snapping and posting takes about 30 seconds.
        </p>
        <Link
          to="/post"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground"
        >
          📸 Snap &amp; Post
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} imageUrl={urls[item.image_path]} />
      ))}
    </div>
  );
}
