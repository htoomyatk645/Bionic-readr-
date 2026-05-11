type Listener<T> = (next: T) => void;

const WRITE_DEBOUNCE_MS = 80;
const LOG = "[bionic-redr/storage]";

function area() {
  const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
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
  const a = area();
  if (a) {
    try {
      await a.set({ [key]: entry.value });
    } catch (err) {
      if (!isContextInvalidated(err)) {
        console.warn(LOG, "set failed for", key, err);
      }
    }
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
  const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
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
