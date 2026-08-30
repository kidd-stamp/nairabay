import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/nairabay/Header";
import { LocationFeed } from "@/components/nairabay/LocationFeed";
import { findPlace, findState, placesForState } from "@/lib/locations";

export const Route = createFileRoute("/nigeria/$state/$place")({
  loader: ({ params }) => {
    const state = findState(params.state);
    if (!state) throw notFound();
    const place = findPlace(state, params.place);
    if (!place) throw notFound();
    return { state, place };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable | NairaBay" }, { name: "robots", content: "noindex" }] };
    }
    const { state, place } = loaderData;
    const title =
      place.kind === "campus"
        ? `${place.name} student marketplace — buy & sell | NairaBay`
        : `Buy & sell in ${place.name}, ${state.name} | NairaBay`;
    const description =
      place.kind === "campus"
        ? `Cheap deals near ${place.name}: phones, laptops, textbooks, fashion and hostel items from students and traders in ${state.name}.`
        : `Free classifieds in ${place.name}, ${state.name}. Snap and post your item in seconds, chat buyers on WhatsApp.`;
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
  component: PlacePage,
});

function PlacePage() {
  const { state, place } = Route.useLoaderData();
  const siblings = placesForState(state).filter((p) => p.slug !== place.slug);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <nav className="text-xs text-muted-foreground">
          <Link to="/nigeria" className="underline underline-offset-4">
            Nigeria
          </Link>{" "}
          /{" "}
          <Link
            to="/nigeria/$state"
            params={{ state: state.slug }}
            className="underline underline-offset-4"
          >
            {state.name}
          </Link>{" "}
          / {place.name}
        </nav>
        <h1 className="mt-2 font-display text-5xl leading-[0.95]">
          {place.kind === "campus" ? `${place.name} marketplace` : `Buy & sell in ${place.name}`}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {place.kind === "campus"
            ? `Students and traders around ${place.name} post here daily — textbooks, gadgets, hostel gear and more.`
            : `Live listings from sellers in and around ${place.name}, ${state.name}.`}
        </p>

        <div className="mt-6">
          <LocationFeed state={state.name} city={place.name} />
        </div>

        <section className="mt-10">
          <h2 className="font-display text-3xl">Nearby in {state.name}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {siblings.map((p) => (
              <Link
                key={p.slug}
                to="/nigeria/$state/$place"
                params={{ state: state.slug, place: p.slug }}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                {p.kind === "campus" ? "🎓 " : ""}
                {p.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
