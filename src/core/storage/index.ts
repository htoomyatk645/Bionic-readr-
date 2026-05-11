type Listener<T> = (next: T) => void;

function area() {
  const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
  try {
    if (c?.storage?.sync) return c.storage.sync;
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
      // unexpected — log for diagnostics but still return fallback
      console.debug?.("[bionic-redr] storage.get failed", err);
    }
    return fallback;
  }
}

export async function setValue<T>(key: string, value: T): Promise<void> {
  const a = area();
  if (!a) return;
  try {
    await a.set({ [key]: value });
  } catch (err) {
    if (!isContextInvalidated(err)) {
      console.debug?.("[bionic-redr] storage.set failed", err);
    }
  }
}

export function onValueChanged<T>(key: string, listener: Listener<T>): () => void {
  const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
  if (!c?.storage?.onChanged) return () => undefined;
  const handler = (changes: { [k: string]: chrome.storage.StorageChange }) => {
    if (key in changes) {
      try {
        listener(changes[key].newValue as T);
      } catch (err) {
        console.debug?.("[bionic-redr] storage listener threw", err);
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
