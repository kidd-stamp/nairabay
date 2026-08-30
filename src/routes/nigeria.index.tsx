import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/nairabay/Header";
import { NETWORKS, STATES } from "@/lib/locations";

export const Route = createFileRoute("/nigeria/")({
  head: () => ({
    meta: [
      { title: "Buy & sell near you — every state in Nigeria | nairaBay" },
      {
        name: "description",
        content:
          "Browse nairaBay listings by state, city, town and campus — Lagos, Abuja, Kano, Port Harcourt, UNILAG, ABU Zaria and every corner of Nigeria.",
      },
      { property: "og:title", content: "Buy & sell near you — every state in Nigeria" },
      {
        property: "og:description",
        content: "Find items for sale in your village, town, city or campus on nairaBay.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NigeriaDirectory,
});

function NigeriaDirectory() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-5xl leading-[0.95]">Buy &amp; sell anywhere in Nigeria 🇳🇬</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          nairaBay covers all 36 states and the FCT — every village, town, city, university and
          polytechnic. Pick your area to see what neighbours are selling, or snap and post your own
          item in seconds.
        </p>

        <section className="mt-8">
          <h2 className="font-display text-3xl">States &amp; capitals</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STATES.map((state) => (
              <Link
                key={state.slug}
                to="/nigeria/$state"
                params={{ state: state.slug }}
                className="surface-card block p-4 transition-shadow hover:shadow-lift"
              >
                <p className="font-sans text-lg font-extrabold">{state.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {state.capital} · {state.cities.length} towns · {state.campuses.length} campuses
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-3xl">Every network works</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Your phone number is your account. Any Nigerian line — or an international one — gives
            you a Bay# like <strong className="text-foreground">bay2342</strong>.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {NETWORKS.map((n) => (
              <li key={n.name} className="bay-chip">
                {n.name}
              </li>
            ))}
            <li className="bay-chip">Diaspora / international lines</li>
          </ul>
        </section>

        <div className="mt-10">
          <Link
            to="/post"
            className="inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-soft"
          >
            📸 Snap &amp; Post in your area
          </Link>
        </div>
      </main>
    </div>
  );
}
