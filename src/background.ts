import { getValue, setValue } from "~core/storage";
import { resolveEffectiveSettings } from "~features/modes";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "~features/settings/defaults";
import type { ReaderSettings } from "~features/settings/types";

const TOGGLE_MESSAGE = { type: "bionic-redr.toggle-sidebar" } as const;

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
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, TOGGLE_MESSAGE);
  } catch {
    // No content script on this tab (chrome://, web store, etc.) — silent.
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

chrome.action.onClicked.addListener(() => {
  void toggleActiveTab();
});

chrome.commands?.onCommand.addListener?.((command) => {
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
