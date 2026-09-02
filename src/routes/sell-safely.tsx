import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/nairabay/Header";

export const Route = createFileRoute("/sell-safely")({
  head: () => ({
    meta: [
      { title: "Sell safely on nairaBay — meet, verify, price & list" },
      {
        name: "description",
        content:
          "How to sell safely on nairaBay: meet buyers in public, verify your Bay#, price items fairly, and write listings that sell fast.",
      },
      {
        property: "og:title",
        content: "Sell safely on nairaBay — meet, verify, price & list",
      },
      {
        property: "og:description",
        content:
          "Safety-first guide for nairaBay sellers: public meetups, phone verification, smart pricing, and listing tips.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SellSafelyPage,
});

const SECTIONS = [
  {
    id: "meet",
    emoji: "🤝",
    title: "Meet buyers the safe way",
    tips: [
      "Always meet in a busy public place — a mall, bank lobby, filling station or school gate.",
      "Bring a friend if you can, and tell someone where you are going.",
      "Daytime only. Avoid late-night or isolated locations.",
      "Let the buyer inspect the item before any money changes hands.",
      "If the buyer refuses a public meetup, walk away. That's a red flag.",
    ],
  },
  {
    id: "verify",
    emoji: "✅",
    title: "Verify your Bay#",
    tips: [
      "Your Bay# is built from the last four digits of your phone number — like bay2342.",
      "After posting, text VERIFY to +234 702 639 0848 from the same number.",
      "Unverified listings stay live for 24 hours so buyers can still see them while you confirm.",
      "A verified badge on your listing helps buyers trust you faster.",
      "You can update your phone number and re-request verification before the timer ends.",
    ],
  },
  {
    id: "price",
    emoji: "🏷️",
    title: "Price it to sell",
    tips: [
      "Check what similar used items sell for on nairaBay, Jiji or Instagram first.",
      "Price a little higher than your lowest acceptable amount — most buyers will negotiate.",
      "Be honest about wear and tear. Buyers will find out when they inspect.",
      "Bundle related items together to move stock faster.",
      "Write the price in ₦ and mention if delivery is included or separate.",
    ],
  },
  {
    id: "list",
    emoji: "📸",
    title: "Listing tips that get replies",
    tips: [
      "Take photos in daylight against a plain background. Show flaws clearly.",
      "Use the real item in your hand — no Google or stock images.",
      "Write a clear title with brand, model and condition, e.g. 'Used HP EliteBook 840 G7'.",
      "Add size, color, reason for selling and location so buyers can decide quickly.",
      "Reply fast. The first responsive seller usually gets the sale.",
    ],
  },
  {
    id: "payment",
    emoji: "💰",
    title: "Handle payment with care",
    tips: [
      "Confirm the money has entered your account before you hand over the item.",
      "Watch out for fake bank alerts. Log into your banking app and check your balance.",
      "Cash is fine for small meetups; bank transfer is safer for bigger amounts.",
      "Never accept overpayment or send money back to a buyer.",
      "If something feels off, report the Bay# from the listing page.",
    ],
  },
];

const QUICK_ANSWERS = [
  {
    q: "Do I need to sign up to sell?",
    a: "No. Just snap a photo, add a price, and enter your phone number. Your Bay# is your seller identity.",
  },
  {
    q: "How long does a listing stay live?",
    a: "Listings stay live as long as you keep them active. Unverified sellers get a 24-hour grace window to text VERIFY.",
  },
  {
    q: "Can I sell for someone else?",
    a: "Yes, but you are responsible for the listing. Choose 'selling for owner' as the reason for selling.",
  },
  {
    q: "What if a buyer messages me on WhatsApp?",
    a: "That's normal on nairaBay. You can also chat directly on the listing page. Keep all communication respectful and within public view when possible.",
  },
];

function SellSafelyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <span className="bay-chip">🛡️ Seller safety</span>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] md:text-6xl">
          Sell safely on nairaBay
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Everything you need to know before meeting a buyer, setting a price, or posting your first
          item.
        </p>

        <nav
          aria-label="Safety guide sections"
          className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="shrink-0 snap-start rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              {section.emoji} {section.title}
            </a>
          ))}
        </nav>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="surface-card scroll-mt-24 p-5 md:p-7"
            >
              <h2 className="flex items-center gap-3 font-display text-3xl md:text-4xl">
                <span>{section.emoji}</span>
                <span>{section.title}</span>
              </h2>
              <ul className="mt-4 space-y-3">
                {section.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="surface-card mt-8 p-5 md:p-7">
          <h2 className="font-display text-3xl">Quick answers</h2>
          <dl className="mt-4 space-y-4">
            {QUICK_ANSWERS.map(({ q, a }) => (
              <div key={q}>
                <dt className="font-semibold text-foreground">{q}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            to="/post"
            className="rounded-full bg-primary px-6 py-3 text-center font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.03]"
          >
            📸 Snap &amp; Post now
          </Link>
          <Link
            to="/rules"
            className="rounded-full border border-border px-6 py-3 text-center font-bold transition-colors hover:bg-secondary"
          >
            Read the nairaBay Code
          </Link>
        </div>

        <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="underline underline-offset-4">
            Back to nairaBay home
          </Link>
        </footer>
      </main>
    </div>
  );
}
