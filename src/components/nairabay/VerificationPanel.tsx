import { useEffect, useState } from "react";
import {
  VERIFY_GRACE_HOURS,
  VERIFY_KEYWORD,
  VERIFY_NUMBER,
  fetchSellerVerification,
  previewBayHandle,
  saveSession,
  updateSellerPhone,
  verifySmsLink,
  type BaySession,
} from "@/lib/nairabay";

type Props = {
  session: BaySession;
  /** When the listing was created — drives the countdown. */
  createdAt: string;
  verified: boolean;
  onSessionChange?: (session: BaySession) => void;
  onVerified?: () => void;
};

function formatCountdown(msLeft: number) {
  if (msLeft <= 0) return "0h 00m 00s";
  const total = Math.floor(msLeft / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

/** Live verification status: countdown, phone editing and auto-refreshing badge. */
export function VerificationPanel({
  session,
  createdAt,
  verified,
  onSessionChange,
  onVerified,
}: Props) {
  const [now, setNow] = useState(() => Date.now());
  const [editing, setEditing] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState(session.phone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const deadline = new Date(createdAt).getTime() + VERIFY_GRACE_HOURS * 3600_000;
  const msLeft = deadline - now;
  const expired = msLeft <= 0;

  useEffect(() => {
    if (verified) return;
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, [verified]);

  // Poll the seller row so the badge flips the moment the VERIFY text lands.
  useEffect(() => {
    if (verified) return;
    let cancelled = false;
    const check = async () => {
      try {
        const status = await fetchSellerVerification(session.sellerId);
        if (!cancelled && status.verified) onVerified?.();
      } catch {
        /* keep polling */
      }
    };
    void check();
    const timer = window.setInterval(check, 6000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [session.sellerId, verified, onVerified]);

  const saveNewPhone = async () => {
    setError("");
    setNotice("");
    if (!previewBayHandle(phoneDraft)) {
      setError("Enter a valid phone number.");
      return;
    }
    setBusy(true);
    try {
      const updated = await updateSellerPhone(session, phoneDraft);
      saveSession(updated);
      onSessionChange?.(updated);
      setPhoneDraft(updated.phone);
      setEditing(false);
      setNotice(`Number updated — your Bay# is now #${updated.bayHandle}. Text ${VERIFY_KEYWORD} from it.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update that number.");
    } finally {
      setBusy(false);
    }
  };

  if (verified) {
    return (
      <div className="surface-card space-y-1 p-5">
        <p className="text-lg font-bold text-whatsapp">✅ Phone number verified</p>
        <p className="text-sm text-muted-foreground">
          Bay <span className="bay-chip">#{session.bayHandle}</span> is confirmed — your listings stay
          live for good.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card space-y-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-bold">{expired ? "⛔ Verification window closed" : "⏳ Awaiting your VERIFY text"}</p>
        <span
          className={
            "rounded-full px-3 py-1 font-mono text-sm font-bold " +
            (expired ? "bg-destructive text-primary-foreground" : "bg-warning text-warning-foreground")
          }
          aria-live="polite"
        >
          {expired ? "expired" : formatCountdown(msLeft)}
        </span>
      </div>

      <p className="text-sm">
        {expired
          ? "Your listing is hidden from the market until you verify. Send the text now and it comes back."
          : `Your listing stays live while this timer runs. Text ${VERIFY_KEYWORD} to ${VERIFY_NUMBER} from your number and this panel updates by itself.`}
      </p>

      <div className="rounded-xl bg-secondary p-3 text-sm">
        <p className="font-bold">
          Verifying number: <span className="font-mono">{session.phone}</span>
        </p>
        <p className="text-xs text-muted-foreground">Bay# #{session.bayHandle}</p>
        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setNotice("");
              setError("");
            }}
            className="mt-2 text-xs font-bold underline underline-offset-4"
          >
            ✏️ Wrong number? Edit &amp; re-run verification
          </button>
        ) : (
          <div className="mt-2 space-y-2">
            <input
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
              inputMode="tel"
              placeholder="e.g. 0803 123 2342"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            {previewBayHandle(phoneDraft) ? (
              <p className="text-xs text-muted-foreground">
                New Bay# will be <span className="font-bold">#{previewBayHandle(phoneDraft)}</span>
              </p>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveNewPhone()}
                className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save & re-run verification"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setPhoneDraft(session.phone);
                  setError("");
                }}
                className="rounded-full border border-border px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <a
        href={verifySmsLink()}
        className="block rounded-2xl bg-whatsapp px-5 py-4 text-center text-lg font-bold text-whatsapp-foreground shadow-soft"
      >
        💬 Open my SMS app &amp; send {VERIFY_KEYWORD}
      </a>

      {notice ? <p className="text-xs font-bold text-whatsapp">{notice}</p> : null}
      {error ? <p className="text-xs font-bold text-destructive">{error}</p> : null}
    </div>
  );
}
