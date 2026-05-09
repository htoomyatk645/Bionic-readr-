import { readRecord, writeRecord } from "./db";
import type { ReadingSession } from "./types";

export function canonicalUrl(href: string): string {
  try {
    const u = new URL(href);
    u.hash = "";
    return u.toString();
  } catch {
    return href;
  }
}

export async function readSession(url: string): Promise<ReadingSession | null> {
  return readRecord<ReadingSession>(canonicalUrl(url));
}

export async function writeSession(session: ReadingSession): Promise<void> {
  await writeRecord({ ...session, url: canonicalUrl(session.url) });
}
