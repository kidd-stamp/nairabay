import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadSession, type BaySession } from "@/lib/nairabay";
import { loadChatIdentity, type ChatIdentity } from "@/lib/chat";

const MAIN_TABS = [
  { to: "/", icon: "🏠", label: "Home" },
  { to: "/post", icon: "📸", label: "Post" },
  { to: "/verify", icon: "✅", label: "Verify" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const [session, setSession] = useState<BaySession | null>(null);
  const [identity, setIdentity] = useState<ChatIdentity | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setSession(loadSession());
    setIdentity(loadChatIdentity());
  }, []);

  return (
    <>
      {moreOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMoreOpen(false)}
            aria-label="Close menu"
          />
          <div className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl border border-border bg-card p-4 shadow-soft md:bottom-8">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
              More
            </p>
            <div className="grid grid-cols-2 gap-2">
              <MoreLink to="/sell-safely" onClick={() => setMoreOpen(false)}>
                🛡️ Sell safely
              </MoreLink>
              <MoreLink to="/faq" onClick={() => setMoreOpen(false)}>
                ❓ FAQ
              </MoreLink>
              <MoreLink to="/rules" onClick={() => setMoreOpen(false)}>
                📜 The Bay Code
              </MoreLink>
              <MoreLink to="/nigeria" onClick={() => setMoreOpen(false)}>
                🇳🇬 Browse Nigeria
              </MoreLink>
              {session ? (
                <MoreLink
                  to="/bay/$handle"
                  params={{ handle: session.bayHandle }}
                  onClick={() => setMoreOpen(false)}
                >
                  🏷️ Your Bay#
                </MoreLink>
              ) : null}
              {identity ? (
                <MoreLink to="/inbox" onClick={() => setMoreOpen(false)}>
                  💬 Inbox
                </MoreLink>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur md:hidden">
        <div
          className="mx-auto flex h-16 max-w-md items-center justify-around px-2"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {MAIN_TABS.map((tab) => {
            const active =
              pathname === tab.to || (tab.to !== "/" && pathname.startsWith(`${tab.to}/`));
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-lg leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
              moreOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-lg leading-none">☰</span>
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}

function MoreLink({
  to,
  params,
  children,
  onClick,
}: {
  to: string;
  params?: Record<string, string>;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      params={params as never}
      onClick={onClick}
      className="rounded-xl bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
    >
      {children}
    </Link>
  );
}
