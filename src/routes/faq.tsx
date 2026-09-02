import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/nairabay/Header";

const TITLE = "nairaBay FAQ — selling, payments, delivery & verification";
const DESCRIPTION =
  "Answers to the most common questions about selling on nairaBay: getting started, payments and fake alerts, delivery, Bay# verification, banned items and listing rules.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

type Faq = { q: string; a: string };
type Group = { id: string; emoji: string; title: string; faqs: Faq[] };

const GROUPS: Group[] = [
  {
    id: "getting-started",
    emoji: "🚀",
    title: "Getting started",
    faqs: [
      {
        q: "How do I sell online in Nigeria with nairaBay?",
        a: "Tap Snap & Post, add a photo of the item, fill in the title, price and location, then enter your phone number. Your listing goes live in seconds — no account, no password.",
      },
      {
        q: "What do I need to start selling?",
        a: "A phone with a camera (or any saved photo), a Nigerian or international phone number, and a price in mind. That's all.",
      },
      {
        q: "Can I sell from my phone only?",
        a: "Yes. nairaBay is built mobile-first for budget Android phones and low data. You can also install it to your home screen and post even when your connection drops — the listing uploads once you're back online.",
      },
      {
        q: "Do I need a website or a shop?",
        a: "No. Your Bay# page acts as your shop front and shows every item you have listed.",
      },
      {
        q: "Does it cost anything to list?",
        a: "No. Posting on nairaBay is free.",
      },
    ],
  },
  {
    id: "payments",
    emoji: "💳",
    title: "Payments",
    faqs: [
      {
        q: "How do I get paid?",
        a: "You and the buyer agree directly — usually cash at the meetup or a bank transfer. nairaBay does not hold or process money.",
      },
      {
        q: "What is a fake bank alert and how do I avoid it?",
        a: "Scammers send an SMS or screenshot that looks like a credit alert. Never trust the message. Open your banking app, refresh your balance and confirm the money has actually landed before you hand over the item.",
      },
      {
        q: "Is payment on delivery safe?",
        a: "It is safe when you or a trusted dispatch rider collects the cash before releasing the item. Avoid sending goods ahead of payment to someone you have not met.",
      },
      {
        q: "A buyer wants to overpay and get change back — is that okay?",
        a: "No. Overpayment with a request for a refund is one of the most common scams. Refuse it and report the Bay# if it continues.",
      },
      {
        q: "Can I sell without a bank account?",
        a: "Yes — meet in public and take cash. Count it in a safe, well-lit place before completing the handover.",
      },
    ],
  },
  {
    id: "delivery",
    emoji: "🛵",
    title: "Delivery & logistics",
    faqs: [
      {
        q: "How do I deliver items to buyers?",
        a: "Most nairaBay deals are hand-to-hand at a public meetup. For other towns, use a dispatch rider or a park/courier service and agree who pays before you ship.",
      },
      {
        q: "Who pays for delivery?",
        a: "Whatever you both agree — just state it clearly in your listing, e.g. 'price excludes delivery'.",
      },
      {
        q: "What if the buyer refuses the item at delivery?",
        a: "Let buyers inspect before payment so this rarely happens. If you ship, ask for the delivery fee upfront so you are not out of pocket.",
      },
      {
        q: "Do you handle returns?",
        a: "No. Used items are sold as seen, so describe faults honestly and let the buyer inspect. Agree any return terms between yourselves before money changes hands.",
      },
    ],
  },
  {
    id: "verification",
    emoji: "✅",
    title: "Verification & your Bay#",
    faqs: [
      {
        q: "What is a Bay#?",
        a: "It is your seller identity, built from the last four digits of your phone number — for example bay2342. Buyers use it to find all your listings on one page.",
      },
      {
        q: "How do I verify my phone number?",
        a: "Text the word VERIFY to +234 702 639 0848 from the same number you used to post. Verification usually confirms within a minute.",
      },
      {
        q: "Can I sell before verifying?",
        a: "Yes. Your listing stays live for a 24-hour grace period so buyers can still see it while you confirm.",
      },
      {
        q: "What happens after 24 hours if I don't verify?",
        a: "The listing is hidden from the feed. Verify your number and it becomes visible again.",
      },
      {
        q: "I typed the wrong phone number — can I change it?",
        a: "Yes. Open the /verify page or your listing's verification panel, edit your number and re-request verification before the timer ends.",
      },
    ],
  },
  {
    id: "rules",
    emoji: "📜",
    title: "Rules & limits",
    faqs: [
      {
        q: "What am I not allowed to sell?",
        a: "No weapons, drugs, stolen goods, live animals, counterfeit products, human parts, or anything illegal in Nigeria. See the nairaBay Code for the full list.",
      },
      {
        q: "Can I sell an item for someone else?",
        a: "Yes. Choose 'selling for owner' as the reason for selling — but you are responsible for the listing and the handover.",
      },
      {
        q: "How long does my listing stay live?",
        a: "As long as you keep it active. Verified listings do not expire automatically; unverified ones are hidden after 24 hours.",
      },
      {
        q: "What happens if someone reports my Bay#?",
        a: "Our team reviews the report. Genuine sellers are unaffected; repeated scam reports get the Bay# removed from nairaBay.",
      },
    ],
  },
  {
    id: "buyers",
    emoji: "🛒",
    title: "For buyers",
    faqs: [
      {
        q: "How do I contact a seller?",
        a: "Open the listing and chat inside nairaBay, or tap the WhatsApp button to message the seller directly.",
      },
      {
        q: "How do I know a seller is real?",
        a: "Look for the verified badge on the listing, check their Bay# page for other items, and always inspect the item in person before paying.",
      },
      {
        q: "What should I do if a listing looks like a scam?",
        a: "Do not send any money. Use the Report button on the listing to flag the Bay# for our team.",
      },
      {
        q: "Why does a listing show 'new seller'?",
        a: "It means the Bay# was created in the last 24 hours. It is not automatically a bad sign — just take extra care and meet in public.",
      },
    ],
  },
];

function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((g) =>
      g.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    ),
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <span className="bay-chip">❓ Questions &amp; answers</span>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] md:text-6xl">
          nairaBay FAQ
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Everything buyers and sellers ask about posting, payments, delivery and Bay#
          verification.
        </p>

        <nav
          aria-label="FAQ sections"
          className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {GROUPS.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="shrink-0 snap-start rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              {g.emoji} {g.title}
            </a>
          ))}
        </nav>

        <div className="mt-10 space-y-8">
          {GROUPS.map((g) => (
            <section key={g.id} id={g.id} className="surface-card scroll-mt-24 p-5 md:p-7">
              <h2 className="flex items-center gap-3 font-display text-3xl md:text-4xl">
                <span>{g.emoji}</span>
                <span>{g.title}</span>
              </h2>
              <dl className="mt-4 space-y-4">
                {g.faqs.map((f) => (
                  <div key={f.q}>
                    <dt className="font-semibold text-foreground">{f.q}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            to="/post"
            className="rounded-full bg-primary px-6 py-3 text-center font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.03]"
          >
            📸 Snap &amp; Post now
          </Link>
          <Link
            to="/sell-safely"
            className="rounded-full border border-border px-6 py-3 text-center font-bold transition-colors hover:bg-secondary"
          >
            Read the safety guide
          </Link>
        </div>

        <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="underline underline-offset-4">
            Back to nairaBay home
          </Link>
        </footer>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
    </div>
  );
}
