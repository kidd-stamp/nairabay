import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/nairabay/Header";
import { VerificationPanel } from "@/components/nairabay/VerificationPanel";
import {
  VERIFY_KEYWORD,
  VERIFY_NUMBER,
  findSellerByPhone,
  loadSession,
  previewBayHandle,
  type BaySession,
  type Seller,
} from "@/lib/nairabay";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify your Bay# — nairaBay" },
      {
        name: "description",
        content:
          "Confirm your nairaBay Bay# by texting VERIFY from your phone. Track the countdown and see the moment your number is confirmed.",
      },
      { property: "og:title", content: "Verify your Bay# on nairaBay" },
      {
        property: "og:description",
        content: "Text VERIFY from your number and watch your bay confirm live, right in the app.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const [session, setSession] = useState<BaySession | null>(null);
  const [phone, setPhone] = useState("");
  const [seller, setSeller] = useState<Seller | null>(null);
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const existing = loadSession();
    if (!existing) return;
    setSession(existing);
    setPhone(existing.phone);
    void lookup(existing.phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lookup = async (value: string) => {
    setError("");
    if (!previewBayHandle(value)) {
      setError("Enter the phone number you posted with.");
      return;
    }
    setBusy(true);
    try {
      const found = await findSellerByPhone(value);
      if (!found) {
        setSeller(null);
        setError("No Bay# for that number yet — post your first item to create one.");
        return;
      }
      setSeller(found);
      setVerified(Boolean(found.phone_verified_at));
    } catch {
      setError("Could not check that number. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const panelSession: BaySession | null = seller
    ? {
        sellerId: seller.id,
        bayHandle: seller.bay_handle,
        sellerKey: session?.sellerId === seller.id ? session.sellerKey : "",
        phone: seller.phone_number,
      }
    : null;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="font-display text-4xl">Verify your Bay# 📲</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Text <span className="font-bold">{VERIFY_KEYWORD}</span> to{" "}
          <span className="font-bold">{VERIFY_NUMBER}</span> from your selling number. This page
          confirms it for you the moment it lands.
        </p>

        <div className="surface-card mt-6 space-y-3 p-5">
          <label className="block text-sm font-bold" htmlFor="verify-phone">
            Your phone number
          </label>
          <input
            id="verify-phone"
            value={phone}
            inputMode="tel"
            onChange={(e) => setPhone(e.target.value.slice(0, 20))}
            placeholder="e.g. 0803 123 2342"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void lookup(phone)}
            className="w-full rounded-2xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Checking…" : "Find my Bay#"}
          </button>
          {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
        </div>

        {panelSession && seller ? (
          <div className="mt-4">
            <VerificationPanel
              session={panelSession}
              createdAt={seller.created_at}
              verified={verified}
              allowEdit={Boolean(panelSession.sellerKey)}
              onSessionChange={(next) => {
                setSession(next);
                void lookup(next.phone);
              }}
              onVerified={() => setVerified(true)}
            />
          </div>
        ) : null}

        <p className="mt-6 text-sm text-muted-foreground">
          No listing yet?{" "}
          <Link to="/post" className="font-bold underline underline-offset-4">
            Snap &amp; Post
          </Link>{" "}
          — your Bay# is created automatically.
        </p>
      </div>
    </div>
  );
}
