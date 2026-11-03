// Reading-position memory lives in the extension's own chrome.storage.local,
// never in the host page's IndexedDB (which the page itself could read and
// which would scatter our data across every origin the user visits).

const PREFIX = "bionic-redr.memory.v1:";
const MAX_RECORDS = 400;

function area(): chrome.storage.LocalStorageArea | null {
  try {
    const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
    return c?.storage?.local ?? null;
  } catch {
    return null;
  }
}

export async function readRecord<T>(key: string): Promise<T | null> {
  const a = area();
  if (!a) return null;
  try {
    const k = PREFIX + key;
    const result = await a.get(k);
    return (result?.[k] as T | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function writeRecord<T extends { url: string }>(value: T): Promise<void> {
  const a = area();
  if (!a) return;
  try {
    await a.set({ [PREFIX + value.url]: value });
    if (Math.random() < 0.05) void prune();
  } catch {
    /* best-effort */
  }
}

export async function deleteRecord(key: string): Promise<void> {
  const a = area();
  if (!a) return;
  try {
    await a.remove(PREFIX + key);
  } catch {
    /* best-effort */
  }
}

async function memoryKeys(): Promise<Array<{ key: string; lastVisitAt: number }>> {
  const a = area();
  if (!a) return [];
  const all = (await a.get(null)) as Record<string, unknown>;
  return Object.keys(all)
    .filter((k) => k.startsWith(PREFIX))
    .map((key) => ({
      key,
      lastVisitAt: Number((all[key] as { lastVisitAt?: number } | undefined)?.lastVisitAt ?? 0)
    }));
}

async function prune(): Promise<void> {
  const a = area();
  if (!a) return;
  try {
    const keys = await memoryKeys();
    if (keys.length <= MAX_RECORDS) return;
    keys.sort((x, y) => x.lastVisitAt - y.lastVisitAt);
    await a.remove(keys.slice(0, keys.length - MAX_RECORDS).map((k) => k.key));
  } catch {
    /* best-effort */
  }
}

export async function countRecords(): Promise<number> {
  try {
    return (await memoryKeys()).length;
  } catch {
    return 0;
  }
}

export async function clearAll(): Promise<void> {
  const a = area();
  if (!a) return;
  try {
    const keys = await memoryKeys();
    if (keys.length) await a.remove(keys.map((k) => k.key));
  } catch {
    /* best-effort */
  }
}
