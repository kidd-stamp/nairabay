import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Header } from "@/components/nairabay/Header";
import { SafetyNotice } from "@/components/nairabay/SafetyNotice";
import {
  VERIFY_KEYWORD,
  VERIFY_NUMBER,
  bumpViews,
  fetchItem,
  formatNaira,
  hoursLeftToVerify,
  isFreshAccount,
  loadSession,
  setItemStatus,
  signedImageUrl,
  timeAgo,
  verifySmsLink,
  whatsappLink,
} from "@/lib/nairabay";

export const Route = createFileRoute("/item/$id")({
  head: () => ({
    meta: [
      { title: "Item for sale — NairaBay" },
      {
        name: "description",
        content: "See the photo, price and location, then chat the seller straight on WhatsApp.",
      },
      { property: "og:title", content: "Item for sale on NairaBay" },
      {
        property: "og:description",
        content: "Photo, price, location and a direct WhatsApp chat with the seller.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ItemPage,
});

function ItemPage() {
  const { id } = Route.useParams();
  const [status, setStatus] = useState<string | null>(null);

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: () => fetchItem(id),
  });

  const { data: imageUrl } = useQuery({
    queryKey: ["item-image", item?.image_path],
    queryFn: () => signedImageUrl(item!.image_path),
    enabled: Boolean(item?.image_path),
  });

  useEffect(() => {
    void bumpViews(id);
  }, [id]);

  const session = typeof window !== "undefined" ? loadSession() : null;
  const isOwner = Boolean(session && item && session.sellerId === item.seller_id);
  const currentStatus = status ?? item?.status ?? "active";

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="surface-card h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-display text-4xl">This listing is gone</h1>
          <Link to="/" className="mt-4 inline-block font-bold underline underline-offset-4">
            Back to the market
          </Link>
        </div>
      </div>
    );
  }

  const seller = item.seller;
  const chatMessage = `Hi #${seller?.bay_handle ?? "NairaBay"}, I saw your "${item.title}" (${formatNaira(
    Number(item.price),
  )}) on NairaBay. Is it still available?`;

  const changeStatus = async (next: "sold" | "removed" | "active") => {
    if (!session) return;
    const ok = await setItemStatus(item.id, session.sellerKey, next);
    if (ok) setStatus(next);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="surface-card overflow-hidden">
          <div className="aspect-square w-full bg-muted md:aspect-[4/3]">
            {imageUrl ? (
              <img src={imageUrl} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full animate-pulse bg-muted" />
            )}
          </div>
          <div className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bay-chip">{item.category}</span>
              {currentStatus === "sold" ? (
                <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">
                  SOLD
                </span>
              ) : null}
            </div>
            <h1 className="font-display text-4xl leading-none">{item.title}</h1>
            <p className="font-display text-3xl text-primary">{formatNaira(Number(item.price))}</p>
            <p className="text-sm text-muted-foreground">
              📍 {[item.location_city, item.location_state].filter(Boolean).join(", ") || "Nigeria"} ·{" "}
              {timeAgo(item.created_at)} · {item.views} views
            </p>
            {item.description ? (
              <p className="whitespace-pre-line text-sm leading-relaxed">{item.description}</p>
            ) : null}

            {seller ? (
              <div className="flex items-center justify-between rounded-xl bg-secondary p-3 text-sm">
                <div>
                  <p className="font-bold">
                    Seller{" "}
                    <Link
                      to="/bay/$handle"
                      params={{ handle: seller.bay_handle }}
                      className="underline underline-offset-4"
                    >
                      #{seller.bay_handle}
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {timeAgo(seller.created_at)}
                  </p>
                </div>
                {isFreshAccount(seller.created_at) ? (
                  <span className="max-w-[55%] rounded-lg bg-warning px-2 py-1 text-[11px] font-semibold text-warning-foreground">
                    ⚠️ Account created less than 24 hours ago — proceed with caution.
                  </span>
                ) : null}
              </div>
            ) : null}

            {seller && !seller.phone_verified_at ? (
              <div className="rounded-xl bg-warning p-3 text-sm text-warning-foreground">
                <p className="font-bold">⏳ Phone number not yet verified</p>
                <p className="mt-1 text-xs">
                  This listing is in its {hoursLeftToVerify(item.created_at)}h verification window and
                  will be hidden automatically if the seller does not verify.
                </p>
                {isOwner ? (
                  <a
                    href={verifySmsLink()}
                    className="mt-2 inline-block rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background"
                  >
                    Text {VERIFY_KEYWORD} to {VERIFY_NUMBER} now
                  </a>
                ) : null}
              </div>
            ) : null}

            {seller?.phone_verified_at ? (
              <p className="text-xs font-bold text-whatsapp">✅ Seller phone number verified</p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <SafetyNotice bayHandle={seller?.bay_handle} />

          {seller && currentStatus === "active" ? (
            <a
              href={whatsappLink(seller.phone_number, chatMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl bg-whatsapp px-6 py-4 text-center text-lg font-bold text-whatsapp-foreground shadow-soft"
            >
              💬 Chat seller on WhatsApp
            </a>
          ) : null}

          {isOwner ? (
            <div className="surface-card flex flex-wrap gap-3 p-4 text-sm font-bold">
              <span className="self-center text-muted-foreground">Your listing:</span>
              {currentStatus !== "sold" ? (
                <button
                  type="button"
                  onClick={() => changeStatus("sold")}
                  className="rounded-full bg-primary px-4 py-2 text-primary-foreground"
                >
                  Mark as sold
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => changeStatus("active")}
                  className="rounded-full bg-primary px-4 py-2 text-primary-foreground"
                >
                  Relist as available
                </button>
              )}
              <button
                type="button"
                onClick={() => changeStatus("removed")}
                className="rounded-full border border-destructive px-4 py-2 text-destructive"
              >
                Delete listing
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
