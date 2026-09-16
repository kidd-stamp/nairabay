import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Chrome/Edge/Android install banner. iOS has no install event, so this only appears where supported. */
export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  if (!installPrompt || dismissed) return null;

  return (
    <div className="sticky top-16 z-30 mx-4 mt-2 rounded-2xl border border-border bg-card p-3 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
          ₦
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">Install 080Bay on your phone</p>
          <p className="text-xs text-muted-foreground">One tap to post, verify and sell — even offline.</p>
        </div>
        <button
          type="button"
          onClick={install}
          className="shrink-0 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
        >
          Install
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss install prompt"
          className="shrink-0 p-2 text-sm text-muted-foreground"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
