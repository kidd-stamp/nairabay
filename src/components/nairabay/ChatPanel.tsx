import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  claimChatIdentity,
  fetchThread,
  loadChatIdentity,
  openConversation,
  sendMessage,
  type ChatIdentity,
} from "@/lib/chat";
import { detectLocation, timeAgo } from "@/lib/nairabay";

export function ChatPanel({
  itemId,
  sellerHandle,
  isOwner,
}: {
  itemId: string;
  sellerHandle: string;
  isOwner: boolean;
}) {
  const queryClient = useQueryClient();
  const [identity, setIdentity] = useState<ChatIdentity | null>(null);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIdentity(loadChatIdentity());
  }, []);

  const { data: conversationId } = useQuery({
    queryKey: ["chat-conversation", itemId, identity?.partyId],
    queryFn: () => openConversation(itemId, identity!),
    enabled: Boolean(identity) && !isOwner,
    staleTime: Infinity,
  });

  // Live updates: poll the thread every 3s while the listing page is open.
  const { data: messages } = useQuery({
    queryKey: ["chat-thread", conversationId],
    queryFn: () => fetchThread(conversationId!, identity!),
    enabled: Boolean(conversationId && identity),
    refetchInterval: 3000,
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages?.length]);

  const claim = useMutation({
    mutationFn: async () => {
      let where = city.trim();
      if (!where) {
        try {
          where = (await detectLocation()).city;
        } catch {
          where = "";
        }
      }
      return claimChatIdentity(phone, where);
    },
    onSuccess: (next) => {
      setError(null);
      setIdentity(next);
    },
    onError: (e: Error) => setError(e.message),
  });

  const send = useMutation({
    mutationFn: async (body: string) => sendMessage(conversationId!, identity!, body),
    onSuccess: () => {
      setDraft("");
      void queryClient.invalidateQueries({ queryKey: ["chat-thread", conversationId] });
      void queryClient.invalidateQueries({ queryKey: ["chat-unread"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  if (isOwner) {
    return (
      <div className="surface-card p-4 text-sm">
        <p className="font-bold">💬 Buyer messages</p>
        <p className="mt-1 text-muted-foreground">
          Questions about this listing land in your inbox — open it from the header to reply.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card space-y-3 p-4">
      <div>
        <h2 className="font-display text-2xl leading-none">💬 Message #{sellerHandle}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Agree price and pickup right here on nairaBay. Never send money before you inspect.
        </p>
      </div>

      {!identity ? (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            claim.mutate();
          }}
        >
          <label className="block text-sm font-semibold" htmlFor="chat-phone">
            Your phone number
          </label>
          <input
            id="chat-phone"
            type="tel"
            inputMode="tel"
            required
            maxLength={20}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0803 000 0000"
            className="w-full rounded-xl border border-border bg-background px-3 py-3 text-base"
          />
          <input
            type="text"
            maxLength={30}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Your city (optional — we can detect it)"
            className="w-full rounded-xl border border-border bg-background px-3 py-3 text-base"
          />
          <p className="text-xs text-muted-foreground">
            Already have a Bay#? You&apos;ll chat as your Bay#. Otherwise you get a city handle like
            Lagos2342.
          </p>
          <button
            type="submit"
            disabled={claim.isPending}
            className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-60"
          >
            {claim.isPending ? "Starting chat…" : "Start chatting"}
          </button>
        </form>
      ) : (
        <>
          <p className="text-xs font-semibold text-muted-foreground">
            Chatting as <span className="bay-chip">#{identity.handle}</span>
          </p>
          <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl bg-secondary p-3">
            {messages && messages.length > 0 ? (
              messages.map((m) => (
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
              ))
            ) : (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No messages yet — ask if it&apos;s still available.
              </p>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim() && conversationId) send.mutate(draft);
            }}
          >
            <input
              type="text"
              maxLength={1000}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Is this still available?"
              aria-label="Your message"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-3 text-base"
            />
            <button
              type="submit"
              disabled={send.isPending || !conversationId || !draft.trim()}
              className="rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </>
      )}

      {error ? <p className="text-xs font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}
