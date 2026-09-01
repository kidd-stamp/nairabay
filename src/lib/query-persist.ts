// Persist react-query caches to IndexedDB so previously loaded screens
// (feeds, item pages, Bay# profiles) still open when data drops.
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { createStore, get, set, del } from "idb-keyval";
import type { QueryClient } from "@tanstack/react-query";

let started = false;

export function startQueryPersistence(queryClient: QueryClient) {
  if (started || typeof indexedDB === "undefined") return;
  started = true;

  const store = createStore("nairabay", "query-cache");
  const persister = createAsyncStoragePersister({
    storage: {
      getItem: (key) => get<string>(key, store).then((v) => v ?? null),
      setItem: (key, value) => set(key, value, store),
      removeItem: (key) => del(key, store),
    },
    key: "nairabay-query-cache",
    throttleTime: 1000,
  });

  persistQueryClient({
    // Cast keeps this working when the installer hoists two copies of query-core.
    queryClient: queryClient as unknown as Parameters<typeof persistQueryClient>[0]["queryClient"],
    persister,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    buster: "v1",
    dehydrateOptions: {
      // Don't persist signed image URLs — they expire.
      shouldDehydrateQuery: (query) => query.queryKey[0] !== "item-images",
    },
  });
}
