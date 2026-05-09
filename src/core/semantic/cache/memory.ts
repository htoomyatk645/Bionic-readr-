import type { SemanticAnalysis } from "../types";

interface CacheEntry {
  key: string;
  analysis: SemanticAnalysis;
  insertedAt: number;
}

const MAX_ENTRIES = 24;

const store = new Map<string, CacheEntry>();

export function get(key: string): SemanticAnalysis | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  store.delete(key);
  store.set(key, entry);
  return entry.analysis;
}

export function set(key: string, analysis: SemanticAnalysis): void {
  if (store.has(key)) store.delete(key);
  store.set(key, { key, analysis, insertedAt: Date.now() });
  if (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
}

export function clear(): void {
  store.clear();
}
