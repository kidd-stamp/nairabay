import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Header } from "@/components/nairabay/Header";
import { ItemCard } from "@/components/nairabay/ItemCard";
import { ReportBayDialog } from "@/components/nairabay/ReportBayDialog";
import { fetchBay, isFreshAccount, signedImageUrls, timeAgo, whatsappLink } from "@/lib/nairabay";


export const Route = createFileRoute("/bay/$handle")({
  head: () => ({
    meta: [
      { title: "Seller bay — nairaBay" },
      {
        name: "description",
        content: "Everything this nairaBay seller has for sale, with a direct WhatsApp chat button.",
      },
      { property: "og:title", content: "Seller bay on nairaBay" },
      { property: "og:description", content: "Browse this seller's listings and chat on WhatsApp." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BayPage,
});

function BayPage() {
  const { handle } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["bay", handle],
    queryFn: () => fetchBay(handle),
  });

  const paths = useMemo(() => (data?.items ?? []).map((i) => i.image_path), [data]);
  const { data: urls = {} } = useQuery({
    queryKey: ["bay-images", paths],
    queryFn: () => signedImageUrls(paths),
    enabled: paths.length > 0,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="surface-card h-40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-display text-4xl">No bay called #{handle}</h1>
          <Link to="/" className="mt-4 inline-block font-bold underline underline-offset-4">
            Back to the market
          </Link>
        </div>
      </div>
    );
  }

  const { seller, items } = data;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="surface-card flex flex-wrap items-center gap-4 p-6">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary font-display text-2xl text-primary-foreground">
            {seller.bay_handle.replace("bay", "").slice(0, 4)}
          </span>
          <div>
            <h1 className="font-display text-4xl leading-none">#{seller.bay_handle}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {seller.phone_verified_at ? (
                <span className="rounded-full bg-whatsapp px-2 py-1 text-[11px] font-bold text-whatsapp-foreground">
                  ✅ Phone verified
                </span>
              ) : (
                <span className="rounded-full bg-warning px-2 py-1 text-[11px] font-bold text-warning-foreground">
                  ⏳ Phone not verified yet
                </span>
              )}
              <span>
                {[seller.location_city, seller.location_state].filter(Boolean).join(", ") || "Nigeria"}{" "}
                · joined {timeAgo(seller.created_at)} · {items.length} listing
                {items.length === 1 ? "" : "s"}
              </span>
            </p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-2">
            <a
              href={whatsappLink(seller.phone_number, `Hi #${seller.bay_handle}, I found your bay on nairaBay.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-whatsapp px-5 py-3 font-bold text-whatsapp-foreground"
            >
              💬 Chat on WhatsApp
            </a>
            <ReportBayDialog bayHandle={seller.bay_handle} />
          </div>
        </div>

        {isFreshAccount(seller.created_at) ? (
          <p className="mt-3 rounded-xl bg-warning p-3 text-sm font-semibold text-warning-foreground">
            ⚠️ This bay was created less than 24 hours ago. Meet in public and inspect before paying.
          </p>
        ) : null}


        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} imageUrl={urls[item.image_path]} />
          ))}
        </div>

        {items.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">Nothing posted yet.</p>
        ) : null}
      </div>
    </div>
  );
}
