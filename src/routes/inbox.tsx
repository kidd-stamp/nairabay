import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/nairabay/Header";
import {
  fetchInbox,
  fetchThread,
  loadChatIdentity,
  sendMessage,
  type ChatIdentity,
} from "@/lib/chat";
import { signedImageUrls, timeAgo } from "@/lib/nairabay";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Your chat inbox — nairaBay" },
      {
        name: "description",
        content:
          "Read and reply to buyer and seller messages about price and pickup, all inside nairaBay.",
      },
      { property: "og:title", content: "Your nairaBay chat inbox" },
      {
        property: "og:description",
        content: "Every conversation about your listings and the items you're buying, in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InboxPage,
});

function InboxPage() {
  const queryClient = useQueryClient();
  const [identity, setIdentity] = useState<ChatIdentity | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIdentity(loadChatIdentity());
  }, []);

  const { data: threads } = useQuery({
    queryKey: ["chat-inbox", identity?.partyId],
    queryFn: () => fetchInbox(identity!),
    enabled: Boolean(identity),
    refetchInterval: 5000,
  });

  const paths = useMemo(() => (threads ?? []).map((t) => t.item_image_path), [threads]);
  const { data: images } = useQuery({
    queryKey: ["chat-inbox-images", paths.join(",")],
    queryFn: () => signedImageUrls(paths),
    enabled: paths.length > 0,
  });

  const { data: messages } = useQuery({
    queryKey: ["chat-thread", activeId],
    queryFn: () => fetchThread(activeId!, identity!),
    enabled: Boolean(activeId && identity),
    refetchInterval: 3000,
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages?.length]);

  const send = useMutation({
    mutationFn: async (body: string) => sendMessage(activeId!, identity!, body),
    onSuccess: () => {
      setDraft("");
      void queryClient.invalidateQueries({ queryKey: ["chat-thread", activeId] });
      void queryClient.invalidateQueries({ queryKey: ["chat-inbox"] });
      void queryClient.invalidateQueries({ queryKey: ["chat-unread"] });
    },
  });

  const active = (threads ?? []).find((t) => t.id === activeId) ?? null;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="font-display text-4xl leading-none">💬 Your inbox</h1>

        {!identity ? (
          <p className="mt-4 text-sm text-muted-foreground">
            You don&apos;t have any chats on this device yet. Open any listing and tap{" "}
            <span className="font-bold">Message the seller</span> to start one.
          </p>
        ) : !active ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Chatting as <span className="bay-chip">#{identity.handle}</span>
            </p>
            {(threads ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
            ) : null}
            {(threads ?? []).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveId(t.id)}
                className="surface-card flex w-full items-center gap-3 p-3 text-left"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {images?.[t.item_image_path] ? (
                    <img
                      src={images[t.item_image_path]}
                      alt={t.item_title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-bold">{t.item_title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {t.my_role === "seller" ? "Buyer" : "Seller"} #{t.other_handle} ·{" "}
                    {t.last_body ?? "No messages yet"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{timeAgo(t.last_message_at)}</p>
                </div>
                {t.unread > 0 ? (
                  <span className="rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                    {t.unread}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="rounded-full border border-border px-3 py-2 text-sm font-bold"
              >
                ← All chats
              </button>
              <Link
                to="/item/$id"
                params={{ id: active.item_id }}
                className="line-clamp-1 text-sm font-bold underline underline-offset-4"
              >
                {active.item_title}
              </Link>
            </div>

            <div className="max-h-[60vh] space-y-2 overflow-y-auto rounded-xl bg-secondary p-3">
              {(messages ?? []).map((m) => (
                <div key={m.id} className={m.mine ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.mine
                        ? "max-w-[80%] rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                        : "max-w-[80%] rounded-2xl bg-background px-3 py-2 text-sm"
                    }
                  >
                    <p className="whitespace-pre-line break-words">{m.body}</p>
                    <p className="mt-1 text-[10px] opacity-70">{timeAgo(m.created_at)}</p>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) send.mutate(draft);
              }}
            >
              <input
                type="text"
                maxLength={1000}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                aria-label="Your message"
                placeholder="Type your reply…"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-3 text-base"
              />
              <button
                type="submit"
                disabled={send.isPending || !draft.trim()}
                className="rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
