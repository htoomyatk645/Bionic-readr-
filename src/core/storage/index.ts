type Listener<T> = (next: T) => void;

const area = (() => {
  const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
  if (c?.storage?.sync) return c.storage.sync;
  if (c?.storage?.local) return c.storage.local;
  return null;
})();

export async function getValue<T>(key: string, fallback: T): Promise<T> {
  if (!area) return fallback;
  const result = await area.get(key);
  const value = result?.[key];
  return (value as T | undefined) ?? fallback;
}

export async function setValue<T>(key: string, value: T): Promise<void> {
  if (!area) return;
  await area.set({ [key]: value });
}

export function onValueChanged<T>(key: string, listener: Listener<T>): () => void {
  const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
  if (!c?.storage?.onChanged) return () => undefined;
  const handler = (changes: { [k: string]: chrome.storage.StorageChange }) => {
    if (key in changes) listener(changes[key].newValue as T);
  };
  c.storage.onChanged.addListener(handler);
  return () => c.storage.onChanged.removeListener(handler);
}
