import { getValue, setValue } from "~core/storage";
import { resolveEffectiveSettings } from "~features/modes";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "~features/settings/defaults";
import type { ReaderSettings } from "~features/settings/types";

const TOGGLE_MESSAGE = { type: "bionic-redr.toggle-sidebar" } as const;
const LOG = "[bionic-redr/bg]";

console.info(LOG, "service worker boot");

async function ensureDefaults() {
  const existing = await getValue<ReaderSettings | null>(SETTINGS_KEY, null);
  if (!existing) await setValue(SETTINGS_KEY, DEFAULT_SETTINGS);
}

async function syncBadge(settings: ReaderSettings) {
  const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
  if (!c?.action) return;
  const effective = resolveEffectiveSettings(settings);
  if (effective.bionic.enabled) {
    await c.action.setBadgeText({ text: "" });
  } else {
    await c.action.setBadgeText({ text: "off" });
    await c.action.setBadgeBackgroundColor({ color: "#6c6c76" });
  }
}

async function toggleActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    console.warn(LOG, "no active tab");
    return;
  }
  console.info(LOG, "toggle ->", tab.id, tab.url);
  try {
    await chrome.tabs.sendMessage(tab.id, TOGGLE_MESSAGE);
  } catch (err) {
    const message = (err as { message?: string } | undefined)?.message ?? String(err);
    console.warn(
      LOG,
      "sendMessage failed (no content script on this page?):",
      message
    );
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  console.info(LOG, "onInstalled");
  await ensureDefaults();
  // Defensive: make sure no popup is registered (would block action.onClicked).
  try {
    await chrome.action.setPopup({ popup: "" });
  } catch (err) {
    console.warn(LOG, "setPopup clear failed", err);
  }
  const settings = await getValue<ReaderSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  await syncBadge(settings);
});

chrome.runtime.onStartup?.addListener?.(async () => {
  console.info(LOG, "onStartup");
  try {
    await chrome.action.setPopup({ popup: "" });
  } catch {
    /* ignore */
  }
  const settings = await getValue<ReaderSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  await syncBadge(settings);
});

chrome.action.onClicked.addListener(() => {
  console.info(LOG, "action.onClicked");
  void toggleActiveTab();
});

chrome.commands?.onCommand.addListener?.((command) => {
  console.info(LOG, "command", command);
  if (command === "toggle-sidebar" || command === "_execute_action") {
    void toggleActiveTab();
  }
});

chrome.storage.onChanged.addListener((changes) => {
  const change = changes[SETTINGS_KEY];
  if (!change) return;
  const next = (change.newValue as ReaderSettings | undefined) ?? DEFAULT_SETTINGS;
  void syncBadge(next);
});

// Storage write proxy. Content scripts (sidebar) send writes here so the
// background owns the chrome.storage.local.set call, which keeps the
// write-path consistent and gives us one error log site.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") return false;
  const m = message as { type?: string; key?: string; value?: unknown };
  if (m.type !== "bionic-redr.storage-set" || typeof m.key !== "string") return false;

  chrome.storage.local
    .set({ [m.key]: m.value })
    .then(() => sendResponse({ ok: true }))
    .catch((err: unknown) => {
      const errMsg = (err as { message?: string } | undefined)?.message ?? String(err);
      console.warn(LOG, "storage-set failed for", m.key, errMsg);
      sendResponse({ ok: false, error: errMsg });
    });

  return true; // keep channel open for async sendResponse
});
