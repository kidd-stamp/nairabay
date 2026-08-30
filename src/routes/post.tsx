import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/nairabay/Header";
import {
  CATEGORIES,
  NIGERIAN_STATES,
  VERIFY_GRACE_HOURS,
  VERIFY_KEYWORD,
  VERIFY_NUMBER,
  claimBay,
  createItem,
  detectLocation,
  fetchSellerVerification,
  loadSession,
  previewBayHandle,
  uploadPhoto,
  verifySmsLink,
  type BaySession,
} from "@/lib/nairabay";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Snap & Post — sell on NairaBay in seconds" },
      {
        name: "description",
        content:
          "Three steps: snap a photo, add title and price, drop your phone number. Your Bay# is created instantly — no passwords, no long forms.",
      },
      { property: "og:title", content: "Snap & Post on NairaBay" },
      {
        property: "og:description",
        content: "Photo, price, phone number. Your listing goes live in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<BaySession | null>(null);
  const [step, setStep] = useState(1);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const existing = loadSession();
    setSession(existing);
    if (existing) setPhone(existing.phone);
  }, []);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (selected: File | null) => {
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      setError("That photo is above 10MB. Try a smaller one.");
      return;
    }
    setError("");
    setFile(selected);
    setStep(2);
  };

  const useMyLocation = async () => {
    setLocating(true);
    setError("");
    try {
      const detected = await detectLocation();
      setState(detected.state);
      setCity(detected.city);
    } catch {
      setError("Couldn't detect location — pick your state below.");
    } finally {
      setLocating(false);
    }
  };

  const publish = async () => {
    setError("");
    const cleanTitle = title.trim();
    const numericPrice = Number(price.replace(/[^0-9.]/g, ""));
    if (!file) return setError("Add a photo first.");
    if (cleanTitle.length < 3) return setError("Give your item a title.");
    if (!numericPrice || numericPrice <= 0) return setError("Enter a valid price.");
    if (!category) return setError("Pick a category.");
    if (!previewBayHandle(phone)) return setError("Enter a valid phone number.");
    if (!agreed) return setError("Accept the NairaBay Code to publish.");

    setBusy(true);
    try {
      const active =
        session && session.phone === phone.replace(/[^0-9]/g, "")
          ? session
          : await claimBay({ phone, state, city });
      setSession(active);
      const imagePath = await uploadPhoto(file);
      const id = await createItem({
        sellerId: active.sellerId,
        title: cleanTitle,
        price: numericPrice,
        category,
        description: description.trim() || undefined,
        imagePath,
        state: state || undefined,
        city: city || undefined,
      });
      navigate({ to: "/item/$id", params: { id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  };

  const handlePreview = previewBayHandle(phone);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={
                "h-1.5 flex-1 rounded-full " + (step >= n ? "bg-primary" : "bg-border")
              }
            />
          ))}
        </div>

        <h1 className="font-display text-4xl">Snap &amp; sell in seconds ⚡</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          No forms. No passwords. Just upload and cash out.
        </p>

        {/* Step 1 — photo */}
        <div className="surface-card mt-6 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Step 1 · Photo
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          {preview ? (
            <div className="mt-3 flex items-center gap-4">
              <img
                src={preview}
                alt="Your item"
                className="h-24 w-24 rounded-2xl object-cover"
              />
              <div className="flex flex-col gap-2 text-sm font-semibold">
                <button type="button" className="underline underline-offset-4" onClick={() => fileRef.current?.click()}>
                  Retake / change
                </button>
                <button
                  type="button"
                  className="text-destructive underline underline-offset-4"
                  onClick={() => {
                    setFile(null);
                    setPreview("");
                    setStep(1);
                  }}
                >
                  Remove photo
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-3 w-full rounded-2xl bg-primary px-5 py-6 text-lg font-bold text-primary-foreground shadow-soft"
            >
              📸 Open camera / upload photo
            </button>
          )}
        </div>

        {/* Step 2 — details */}
        <div className="surface-card mt-4 space-y-4 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Step 2 · Details
          </p>

          <Field label="What are you selling?">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              onFocus={() => setStep((s) => Math.max(s, 2))}
              placeholder="e.g. Clean iPhone 13 Pro Max, Nike Dunks..."
              className={inputClass}
            />
          </Field>

          <Field label="Price (₦)">
            <input
              value={price}
              inputMode="numeric"
              onChange={(e) => setPrice(e.target.value.slice(0, 12))}
              placeholder="e.g. 450000"
              className={inputClass}
            />
          </Field>

          <Field label="Category">
            <div className="-mx-1 flex flex-wrap gap-2 px-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs font-semibold " +
                    (category === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-secondary")
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Location">
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground disabled:opacity-60"
            >
              {locating ? "Detecting…" : "📍 Detect my location automatically"}
            </button>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <select value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
                <option value="">State</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value.slice(0, 50))}
                placeholder="City / area"
                className={inputClass}
              />
            </div>
          </Field>

          <Field label="Extra details (optional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Condition, size, colour…"
              className={inputClass}
            />
          </Field>
        </div>

        {/* Step 3 — Bay# */}
        <div className="surface-card mt-4 space-y-4 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Step 3 · Your Bay#
          </p>
          <h2 className="font-display text-2xl">Almost done! Let&apos;s lock it in 🔒</h2>
          <Field label="Your phone number (buyers chat you on WhatsApp)">
            <input
              value={phone}
              inputMode="tel"
              onChange={(e) => {
                setPhone(e.target.value.slice(0, 20));
                setStep(3);
              }}
              placeholder="e.g. 0803 123 2342"
              className={inputClass}
            />
          </Field>
          {handlePreview ? (
            <p className="text-sm">
              Your Bay# will be <span className="bay-chip">#{session?.bayHandle ?? handlePreview}</span>
            </p>
          ) : null}

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--primary)]"
            />
            <span>
              I own this item, the photo is real, and I will never ask a buyer for money before
              delivery. I accept{" "}
              <Link to="/rules" className="font-bold underline underline-offset-4">
                The NairaBay Code
              </Link>
              .
            </span>
          </label>

          {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}

          <button
            type="button"
            onClick={publish}
            disabled={busy}
            className="w-full rounded-2xl bg-primary px-5 py-4 text-lg font-bold text-primary-foreground shadow-soft disabled:opacity-60"
          >
            {busy ? "Publishing…" : "🚀 Publish to NairaBay"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            This device remembers your Bay# — next time you just snap and publish.
          </p>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{label}</p>
      {children}
    </div>
  );
}
