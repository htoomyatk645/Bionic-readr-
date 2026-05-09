import { getValue, setValue } from "~core/storage";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "~features/settings/defaults";
import type { ReaderSettings } from "~features/settings/types";

async function ensureDefaults() {
  const existing = await getValue<ReaderSettings | null>(SETTINGS_KEY, null);
  if (!existing) {
    await setValue(SETTINGS_KEY, DEFAULT_SETTINGS);
  }
}

async function syncBadge(settings: ReaderSettings) {
  const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
  if (!c?.action) return;
  if (settings.bionic.enabled) {
    await c.action.setBadgeText({ text: "" });
  } else {
    await c.action.setBadgeText({ text: "off" });
    await c.action.setBadgeBackgroundColor({ color: "#6c6c76" });
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await ensureDefaults();
  const settings = await getValue<ReaderSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  await syncBadge(settings);
});

chrome.runtime.onStartup?.addListener?.(async () => {
  const settings = await getValue<ReaderSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  await syncBadge(settings);
});

chrome.storage.onChanged.addListener((changes) => {
  const change = changes[SETTINGS_KEY];
  if (!change) return;
  const next = (change.newValue as ReaderSettings | undefined) ?? DEFAULT_SETTINGS;
  void syncBadge(next);
});
