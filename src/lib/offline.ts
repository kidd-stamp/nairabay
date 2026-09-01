// Offline-first storage for nairaBay, backed by IndexedDB (idb-keyval).
// Holds: cached screen data (react-query snapshots), the in-progress listing
// draft, and a queue of listings waiting for the network to come back.
import { createStore, get, set, del } from "idb-keyval";

const store = typeof indexedDB !== "undefined" ? createStore("nairabay", "offline") : undefined;

const DRAFT_KEY = "listing-draft";
const QUEUE_KEY = "listing-queue";

export type ListingDraft = {
  title: string;
  price: string;
  category: string;
  description: string;
  state: string;
  city: string;
  phone: string;
  photo?: Blob | undefined;
  photoName?: string | undefined;
  updatedAt: number;
};

export type QueuedListing = ListingDraft & { id: string; queuedAt: number };

async function safeGet<T>(key: string): Promise<T | undefined> {
  if (!store) return undefined;
  try {
    return (await get<T>(key, store)) ?? undefined;
  } catch {
    return undefined;
  }
}

async function safeSet(key: string, value: unknown) {
  if (!store) return;
  try {
    await set(key, value, store);
  } catch {
    /* private mode / quota — offline extras degrade silently */
  }
}

async function safeDel(key: string) {
  if (!store) return;
  try {
    await del(key, store);
  } catch {
    /* ignore */
  }
}

export const saveDraft = (draft: ListingDraft) => safeSet(DRAFT_KEY, draft);
export const loadDraft = () => safeGet<ListingDraft>(DRAFT_KEY);
export const clearDraft = () => safeDel(DRAFT_KEY);

export async function queueListing(draft: ListingDraft): Promise<QueuedListing> {
  const queued: QueuedListing = {
    ...draft,
    id: crypto.randomUUID(),
    queuedAt: Date.now(),
  };
  const current = (await safeGet<QueuedListing[]>(QUEUE_KEY)) ?? [];
  await safeSet(QUEUE_KEY, [...current, queued]);
  return queued;
}

export const loadQueue = async () => (await safeGet<QueuedListing[]>(QUEUE_KEY)) ?? [];

export async function removeQueued(id: string) {
  const current = await loadQueue();
  await safeSet(
    QUEUE_KEY,
    current.filter((q) => q.id !== id),
  );
}

export function useOnlineStatus() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}
