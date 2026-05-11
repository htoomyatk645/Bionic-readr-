type Listener<T> = (next: T) => void;

const WRITE_DEBOUNCE_MS = 100;
const BG_SET_TYPE = "bionic-redr.storage-set";
const LOG = "[bionic-redr/storage]";

function chromeApi() {
  return (globalThis as unknown as { chrome?: typeof chrome }).chrome;
}

function area() {
  const c = chromeApi();
  try {
    if (c?.storage?.local) return c.storage.local;
  } catch {
    /* extension context invalidated — fall through */
  }
  return null;
}

function isContextInvalidated(err: unknown): boolean {
  const message = (err as { message?: string } | undefined)?.message;
  if (!message) return false;
  return /Extension context invalidated|context invalidated|disconnected/i.test(message);
}

// True if we're in a background service worker (no DOM, no document).
function isBackgroundContext(): boolean {
  return typeof document === "undefined" || typeof window === "undefined";
}

export async function getValue<T>(key: string, fallback: T): Promise<T> {
  const a = area();
  if (!a) return fallback;
  try {
    const result = await a.get(key);
    const value = result?.[key];
    return (value as T | undefined) ?? fallback;
  } catch (err) {
    if (!isContextInvalidated(err)) {
      console.warn(LOG, "get failed", err);
    }
    return fallback;
  }
}

async function directSet(key: string, value: unknown): Promise<void> {
  const a = area();
  if (!a) return;
  try {
    await a.set({ [key]: value });
  } catch (err) {
    if (!isContextInvalidated(err)) {
      console.warn(LOG, "direct set failed for", key, err);
    }
  }
}

async function backgroundSet(key: string, value: unknown): Promise<boolean> {
  const c = chromeApi();
  if (!c?.runtime?.sendMessage) return false;
  try {
    const response = (await c.runtime.sendMessage({ type: BG_SET_TYPE, key, value })) as
      | { ok?: boolean }
      | undefined;
    return response?.ok === true;
  } catch (err) {
    if (!isContextInvalidated(err)) {
      console.warn(LOG, "bg sendMessage failed for", key, err);
    }
    return false;
  }
}

interface PendingWrite {
  value: unknown;
  timer: number;
  resolvers: Array<() => void>;
}

const pending = new Map<string, PendingWrite>();

async function flushKey(key: string): Promise<void> {
  const entry = pending.get(key);
  if (!entry) return;
  pending.delete(key);

  // In a background context we already own the storage write; skip the round-trip.
  // In a content / popup / sidebar context, route through background to keep
  // the write site single-owner. Fall back to direct if the round-trip fails.
  let ok = false;
  if (!isBackgroundContext()) {
    ok = await backgroundSet(key, entry.value);
  }
  if (!ok) {
    await directSet(key, entry.value);
  }
  for (const resolve of entry.resolvers) resolve();
}

export function setValue<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve) => {
    const existing = pending.get(key);
    if (existing) {
      clearTimeout(existing.timer);
      existing.value = value;
      existing.resolvers.push(resolve);
      existing.timer = setTimeout(() => {
        void flushKey(key);
      }, WRITE_DEBOUNCE_MS) as unknown as number;
      return;
    }
    const entry: PendingWrite = {
      value,
      resolvers: [resolve],
      timer: setTimeout(() => {
        void flushKey(key);
      }, WRITE_DEBOUNCE_MS) as unknown as number
    };
    pending.set(key, entry);
  });
}

export async function flushPendingWrites(): Promise<void> {
  await Promise.all(Array.from(pending.keys()).map(flushKey));
}

export function onValueChanged<T>(key: string, listener: Listener<T>): () => void {
  const c = chromeApi();
  if (!c?.storage?.onChanged) return () => undefined;
  const handler = (changes: { [k: string]: chrome.storage.StorageChange }) => {
    if (key in changes) {
      try {
        listener(changes[key].newValue as T);
      } catch (err) {
        console.warn(LOG, "listener threw", err);
      }
    }
  };
  try {
    c.storage.onChanged.addListener(handler);
  } catch {
    return () => undefined;
  }
  return () => {
    try {
      c.storage.onChanged.removeListener(handler);
    } catch {
      /* extension context invalidated */
    }
  };
}
