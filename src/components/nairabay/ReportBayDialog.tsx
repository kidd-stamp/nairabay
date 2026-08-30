import { useState } from "react";
import { REPORT_REASONS, type ReportReason, reportBay } from "@/lib/nairabay";

type Step = "closed" | "form" | "confirm" | "done";

/**
 * Three-step report flow: pick a reason → confirm → submitted.
 * The confirmation step exists so nobody flags a Bay# by accident.
 */
export function ReportBayDialog({
  bayHandle,
  itemId,
  className,
}: {
  bayHandle: string;
  itemId?: string;
  className?: string;
}) {
  const [step, setStep] = useState<Step>("closed");
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setStep("closed");
    setReason("");
    setDetails("");
    setError(null);
  };

  const submit = async () => {
    if (!reason) return;
    setBusy(true);
    setError(null);
    try {
      await reportBay({
        bayHandle,
        reason,
        ...(details.trim() ? { details: details.trim() } : {}),
        ...(itemId ? { itemId } : {}),
      });
      setStep("done");
    } catch {
      setError("We couldn't send that report. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setStep("form")}
        className={
          className ??
          "text-xs font-semibold text-muted-foreground underline underline-offset-4 hover:text-destructive"
        }
      >
        🚩 Report #{bayHandle}
      </button>

      {step !== "closed" ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Report bay ${bayHandle}`}
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4"
        >
          <div className="surface-card w-full max-w-md space-y-4 p-6">
            {step === "form" ? (
              <>
                <div>
                  <h2 className="font-display text-3xl leading-none">Report #{bayHandle}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tell us what looks wrong. Reports are private and reviewed by the nairaBay team.
                  </p>
                </div>

                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r}
                      className={
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors " +
                        (reason === r ? "border-primary bg-secondary" : "border-border hover:bg-secondary")
                      }
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                      />
                      <span className="font-semibold">{r}</span>
                    </label>
                  ))}
                </div>

                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value.slice(0, 500))}
                  placeholder="Anything else we should know? (optional)"
                  rows={3}
                  className="w-full rounded-xl border border-input bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={close} className="rounded-full px-4 py-2 text-sm font-bold">
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!reason}
                    onClick={() => setStep("confirm")}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : null}

            {step === "confirm" ? (
              <>
                <h2 className="font-display text-3xl leading-none">Send this report?</h2>
                <div className="rounded-xl bg-secondary p-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">Bay:</span>{" "}
                    <strong>#{bayHandle}</strong>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Reason:</span> <strong>{reason}</strong>
                  </p>
                  {details.trim() ? (
                    <p className="mt-1 whitespace-pre-line text-muted-foreground">{details.trim()}</p>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  False reports slow down real cases. Only send this if you genuinely believe this bay
                  is suspicious.
                </p>
                {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="rounded-full px-4 py-2 text-sm font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={submit}
                    className="rounded-full bg-destructive px-5 py-2 text-sm font-bold text-destructive-foreground disabled:opacity-50"
                  >
                    {busy ? "Sending..." : "Yes, report this bay"}
                  </button>
                </div>
              </>
            ) : null}

            {step === "done" ? (
              <>
                <h2 className="font-display text-3xl leading-none">Report sent ✅</h2>
                <p className="text-sm text-muted-foreground">
                  Thank you. Our team will review #{bayHandle}. Keep meeting in public and never pay
                  before you inspect.
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
