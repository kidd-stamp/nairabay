import { useOnline } from "@/hooks/useOnline";

/** Slim status strip so sellers know when they're browsing cached data. */
export function OfflineBar() {
  const online = useOnline();
  if (online) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-50 bg-destructive px-4 py-2 text-center text-xs font-semibold text-destructive-foreground"
    >
      📴 You&apos;re offline — showing saved screens. Anything you post is queued and sent
      automatically once your data returns.
    </div>
  );
}
