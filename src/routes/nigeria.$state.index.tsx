import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/nairabay/Header";
import { LocationFeed } from "@/components/nairabay/LocationFeed";
import { findState, placesForState } from "@/lib/locations";

export const Route = createFileRoute("/nigeria/$state/")({
  loader: ({ params }) => {
    const state = findState(params.state);
    if (!state) throw notFound();
    return { state };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable | nairaBay" }, { name: "robots", content: "noindex" }] };
    }
    const { state } = loaderData;
    const title = `Buy & sell in ${state.name} State — nairaBay`;
    const description = `Free classifieds in ${state.name}: phones, fashion, furniture, vehicles and services in ${state.cities.slice(0, 4).join(", ")} and nearby towns and campuses.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: StatePage,
});

function StatePage() {
  const { state } = Route.useLoaderData();
  const places = placesForState(state);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <nav className="text-xs text-muted-foreground">
          <Link to="/nigeria" className="underline underline-offset-4">
            Nigeria
          </Link>{" "}
          / {state.name}
        </nav>
        <h1 className="mt-2 font-display text-5xl leading-[0.95]">
          Buy &amp; sell in {state.name} State
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Live listings from sellers around {state.capital} and across {state.name}. Chat any seller
          straight on WhatsApp — meet in a public place and inspect before you pay.
        </p>

        <section className="mt-8">
          <h2 className="font-display text-3xl">Latest in {state.name}</h2>
          <div className="mt-4">
            <LocationFeed state={state.name} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-3xl">Towns &amp; cities</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {places
              .filter((p) => p.kind === "city")
              .map((p) => (
                <Link
                  key={p.slug}
                  to="/nigeria/$state/$place"
                  params={{ state: state.slug, place: p.slug }}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
                >
                  {p.name}
                </Link>
              ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-3xl">Universities &amp; polytechnics</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {places
              .filter((p) => p.kind === "campus")
              .map((p) => (
                <Link
                  key={p.slug}
                  to="/nigeria/$state/$place"
                  params={{ state: state.slug, place: p.slug }}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
                >
                  🎓 {p.name}
                </Link>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}
