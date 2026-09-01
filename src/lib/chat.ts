import { supabase } from "@/integrations/supabase/client";
import { digitsOnly, loadSession } from "@/lib/nairabay";

export type ChatIdentity = {
  partyId: string;
  handle: string;
  chatKey: string;
  kind: "seller" | "guest";
};

const CHAT_IDENTITY_KEY = "nairabay.chat.identity.v1";

/** A seller's bay session doubles as their chat identity. */
export function loadChatIdentity(): ChatIdentity | null {
  if (typeof window === "undefined") return null;
  const bay = loadSession();
  if (bay) {
    return { partyId: bay.sellerId, handle: bay.bayHandle, chatKey: bay.sellerKey, kind: "seller" };
  }
  try {
    const raw = window.localStorage.getItem(CHAT_IDENTITY_KEY);
    return raw ? (JSON.parse(raw) as ChatIdentity) : null;
  } catch {
    return null;
  }
}

export function saveChatIdentity(identity: ChatIdentity) {
  window.localStorage.setItem(CHAT_IDENTITY_KEY, JSON.stringify(identity));
}

export function clearChatIdentity() {
  window.localStorage.removeItem(CHAT_IDENTITY_KEY);
}

/** Known sellers keep their Bay#; everyone else gets a city handle like Lagos2342. */
export async function claimChatIdentity(phone: string, city?: string): Promise<ChatIdentity> {
  const digits = digitsOnly(phone);
  if (digits.length < 7) throw new Error("Enter a valid phone number");
  const { data, error } = await supabase.rpc("chat_claim_identity", {
    _phone: digits,
    ...(city ? { _city: city } : {}),
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Could not start your chat");
  const identity: ChatIdentity = {
    partyId: row.party_id as string,
    handle: row.handle as string,
    chatKey: row.chat_key as string,
    kind: (row.kind as "seller" | "guest") ?? "guest",
  };
  saveChatIdentity(identity);
  return identity;
}

export async function openConversation(itemId: string, identity: ChatIdentity) {
  const { data, error } = await supabase.rpc("chat_open_conversation", {
    _item_id: itemId,
    _party_id: identity.partyId,
    _chat_key: identity.chatKey,
  });
  if (error) throw error;
  return data as string;
}

export type ChatMessage = {
  id: string;
  sender_role: "buyer" | "seller";
  body: string;
  created_at: string;
  mine: boolean;
};

export async function fetchThread(conversationId: string, identity: ChatIdentity) {
  const { data, error } = await supabase.rpc("chat_thread", {
    _conversation_id: conversationId,
    _party_id: identity.partyId,
    _chat_key: identity.chatKey,
  });
  if (error) throw error;
  return (data ?? []) as unknown as ChatMessage[];
}

export async function sendMessage(conversationId: string, identity: ChatIdentity, body: string) {
  const clean = body.trim().slice(0, 1000);
  if (!clean) return;
  const { error } = await supabase.rpc("chat_send", {
    _conversation_id: conversationId,
    _party_id: identity.partyId,
    _chat_key: identity.chatKey,
    _body: clean,
  });
  if (error) throw error;
}

export type InboxThread = {
  id: string;
  item_id: string;
  item_title: string;
  item_image_path: string;
  my_role: "buyer" | "seller";
  other_handle: string;
  last_body: string | null;
  last_message_at: string;
  unread: number;
};

export async function fetchInbox(identity: ChatIdentity) {
  const { data, error } = await supabase.rpc("chat_inbox", {
    _party_id: identity.partyId,
    _chat_key: identity.chatKey,
  });
  if (error) throw error;
  return (data ?? []) as unknown as InboxThread[];
}

export async function fetchUnreadCount(identity: ChatIdentity) {
  const { data, error } = await supabase.rpc("chat_unread_count", {
    _party_id: identity.partyId,
    _chat_key: identity.chatKey,
  });
  if (error) return 0;
  return Number(data ?? 0);
}
