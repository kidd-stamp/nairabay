import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadSession, type BaySession } from "@/lib/nairabay";
import { fetchUnreadCount, loadChatIdentity, type ChatIdentity } from "@/lib/chat";

export function Header() {
  const [session, setSession] = useState<BaySession | null>(null);
  const [identity, setIdentity] = useState<ChatIdentity | null>(null);

  useEffect(() => {
    setSession(loadSession());
    setIdentity(loadChatIdentity());
  }, []);

  const { data: unread } = useQuery({
    queryKey: ["chat-unread", identity?.partyId],
    queryFn: () => fetchUnreadCount(identity!),
    enabled: Boolean(identity),
    refetchInterval: 10000,
  });


  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            ₦
          </span>
          <span className="font-sans text-2xl font-extrabold leading-none tracking-tight">nairaBay</span>
        </Link>

        <nav className="ml-auto flex items-center gap-2 text-sm font-semibold">
          <Link
            to="/nigeria"
            className="hidden rounded-full px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Near me
          </Link>
          <Link
            to="/sell-safely"
            className="hidden rounded-full px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Sell safely
          </Link>
          <Link
            to="/faq"
            className="hidden rounded-full px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            FAQ
          </Link>
          <Link
            to="/rules"
            className="hidden rounded-full px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            The Code
          </Link>
          <Link
            to="/verify"
            className="hidden rounded-full px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Verify
          </Link>
          {identity ? (
            <Link
              to="/inbox"
              className="relative rounded-full px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={unread ? `Inbox, ${unread} unread messages` : "Inbox"}
            >
              💬
              {unread ? (
                <span className="absolute -right-0 -top-0 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </Link>
          ) : null}
          {session ? (
            <Link
              to="/bay/$handle"
              params={{ handle: session.bayHandle }}
              className="bay-chip"
              aria-label={`Your bay ${session.bayHandle}`}
            >
              #{session.bayHandle}
            </Link>
          ) : null}

          <Link
            to="/post"
            className="rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-soft transition-transform hover:scale-[1.03]"
          >
            📸 Snap &amp; Post
          </Link>
        </nav>
      </div>
    </header>
  );
}
