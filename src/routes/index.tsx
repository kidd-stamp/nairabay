import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import heroImage from "@/assets/hero.jpg";
import { Header } from "@/components/nairabay/Header";
import { ItemCard } from "@/components/nairabay/ItemCard";
import { CATEGORIES, NIGERIAN_STATES, fetchItems, signedImageUrls } from "@/lib/nairabay";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "nairaBay — Snap & sell in seconds, no sign-up stress" },
      {
        name: "description",
        content:
          "nairaBay is the soft-life marketplace for Nigeria and the diaspora. Snap a photo, add a price, get your Bay# from your phone number and publish in seconds.",
      },
      { property: "og:title", content: "nairaBay — Snap & sell in seconds" },
      {
        property: "og:description",
        content: "Post items for sale in seconds. No forms, no passwords. Buyers chat you on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [state, setState] = useState("");

  // Debounce typing so slow networks make one request, not one per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items", category, debounced, state],
    queryFn: () =>
      fetchItems({
        category: category || undefined,
        search: debounced || undefined,
        state: state || undefined,
      }),
  });

  const paths = useMemo(() => items.map((i) => i.image_path), [items]);
  const { data: urls = {} } = useQuery({
    queryKey: ["item-images", paths],
    queryFn: () => signedImageUrls(paths),
    enabled: paths.length > 0,
  });


  return (
    <div className="min-h-screen">
      <Header />

      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="surface-card overflow-hidden md:grid md:grid-cols-2">
          <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
            <span className="bay-chip w-fit">Nigeria · Diaspora · Friends</span>
            <h1 className="font-display text-5xl leading-[0.95] md:text-6xl">
              Snap &amp; sell in seconds ⚡
            </h1>
            <p className="text-muted-foreground">
              No forms. No passwords. Just upload, price it, and cash out. Your phone number gives
              you a Bay# like <strong className="text-foreground">bay2342</strong> — that&apos;s your
              whole identity here.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/post"
                className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.03]"
              >
                📸 Open camera / upload photo
              </Link>
              <Link
                to="/rules"
                className="rounded-full border border-border px-6 py-3 font-bold transition-colors hover:bg-secondary"
              >
                The nairaBay Code
              </Link>
            </div>
          </div>
          <img
            src={heroImage}
            alt="Sneakers, a phone, ankara fabric and accessories laid out for sale on nairaBay"
            width={1600}
            height={1000}
            decoding="async"
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 600px"
            className="h-56 w-full object-cover md:h-full"
          />

        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value.slice(0, 80))}
            placeholder="Search iPhone, sneakers, generator..."
            className="w-full rounded-full border border-input bg-card px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-ring md:max-w-sm"
          />
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            aria-label="Filter by state"
            className="rounded-full border border-input bg-card px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">📍 All Nigeria</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <CategoryPill label="All" active={category === ""} onClick={() => setCategory("")} />
            {CATEGORIES.map((c) => (
              <CategoryPill key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="surface-card h-64 animate-pulse" />
              ))
            : items.map((item, i) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  imageUrl={urls[item.image_path]}
                  priority={i < 2}
                />
              ))}
        </div>


        {!isLoading && items.length === 0 ? (
          <div className="surface-card mt-6 p-10 text-center">
            <p className="font-display text-3xl">Nothing here yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first to post. It takes about 30 seconds.
            </p>
            <Link
              to="/post"
              className="mt-4 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground"
            >
              📸 Snap &amp; Post
            </Link>
          </div>
        ) : null}
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        nairaBay — meet in public, inspect before you pay. ·{" "}
        <Link to="/sell-safely" className="underline underline-offset-4">
          Sell safely
        </Link>{" "}
        ·{" "}
        <Link to="/rules" className="underline underline-offset-4">
          The nairaBay Code
        </Link>
      </footer>
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:bg-secondary")
      }
    >
      {label}
    </button>
  );
}
