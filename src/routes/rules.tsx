import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/nairabay/Header";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "The nairaBay Code — three simple rules" },
      {
        name: "description",
        content:
          "No fakes, no pre-payments, no banned items. The three plain-English rules every nairaBay seller agrees to before posting.",
      },
      { property: "og:title", content: "The nairaBay Code" },
      {
        property: "og:description",
        content: "Three simple rules that keep nairaBay safe: no fakes, no pre-payments, no banned items.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RulesPage,
});

const RULES = [
  {
    title: "No fakes or scams",
    body: "You must own the item you post. No stock photos from Google or Pinterest — take a real photo of the actual item in your hands right now.",
  },
  {
    title: "No pre-payments",
    body: "Never demand money before the buyer sees the item. No commitment fees, no delivery token, no holding funds. Money changes hands face to face.",
  },
  {
    title: "No banned items",
    body: "No illegal goods, weapons, medications or financial schemes. nairaBay is for clothes, books, electronics, real estate, services, gadgets, vehicles and everyday items.",
  },
];

function RulesPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <span className="bay-chip">🟢 Keep it real</span>
        <h1 className="mt-3 font-sans text-5xl font-extrabold leading-none tracking-tight">The nairaBay Code</h1>
        <p className="mt-3 text-muted-foreground">
          Three simple rules. Break them and your Bay# is permanently banned from the network.
        </p>

        <ol className="mt-6 space-y-4">
          {RULES.map((rule, index) => (
            <li key={rule.title} className="surface-card p-5">
              <p className="font-display text-2xl">
                {index + 1}. {rule.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rule.body}</p>
            </li>
          ))}
        </ol>

        <div className="surface-card mt-6 p-5">
          <h2 className="font-display text-2xl">Buyer safety</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Never pay in advance. Meet in a public place like a mall or bank, inspect the item, then
            pay. If a bay feels suspicious, report it from the listing page.
          </p>
        </div>

        <Link
          to="/post"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-soft"
        >
          📸 I agree — start posting
        </Link>
      </div>
    </div>
  );
}
