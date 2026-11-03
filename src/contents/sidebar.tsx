import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Sidebar } from "~ui/sidebar/Sidebar";

declare const __SIDEBAR_CSS__: string;

const TOGGLE_MESSAGE_TYPE = "bionic-redr.toggle-sidebar";
const CLOSE_MESSAGE_TYPE = "bionic-redr.close-sidebar";
const HOST_ID = "bionic-redr-sidebar-host";
const LOG = "[bionic-redr/sidebar]";

function SidebarRoot() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
    if (!c?.runtime?.onMessage) {
      console.warn(LOG, "chrome.runtime.onMessage unavailable");
      return;
    }

    const handler = (
      message: { type?: string } | null,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: unknown) => void
    ) => {
      if (!message || typeof message !== "object") return false;
      if (message.type === TOGGLE_MESSAGE_TYPE) {
        setOpen((v) => !v);
        sendResponse({ ok: true });
        return false;
      }
      if (message.type === CLOSE_MESSAGE_TYPE) {
        setOpen(false);
        sendResponse({ ok: true });
        return false;
      }
      return false;
    };

    try {
      c.runtime.onMessage.addListener(handler);
    } catch (err) {
      console.warn(LOG, "listener register failed", err);
    }

    return () => {
      try {
        c.runtime.onMessage.removeListener(handler);
      } catch {
        /* context invalidated */
      }
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      // Fallback for when Chrome didn't bind the command shortcut (conflicts).
      if (meta && e.shiftKey && !e.altKey && e.code === "KeyB") {
        e.preventDefault();
        e.stopPropagation();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return <Sidebar open={open} onClose={() => setOpen(false)} />;
}

const FONT_STYLE_ID = "bionic-redr-font";

// @font-face rules are ignored inside shadow roots, so the panel's bundled font
// is registered on the document under a private family name that can't clash
// with anything the page uses.
function registerFont() {
  if (document.getElementById(FONT_STYLE_ID)) return;
  let url: string;
  try {
    url = chrome.runtime.getURL("fonts/inter-latin-wght-normal.woff2");
  } catch {
    return;
  }
  const style = document.createElement("style");
  style.id = FONT_STYLE_ID;
  style.textContent = `@font-face{font-family:"Bionic Redr Inter";font-style:normal;font-display:swap;font-weight:100 900;src:url("${url}") format("woff2-variations");}`;
  (document.head ?? document.documentElement).appendChild(style);
}

function mount() {
  if (document.getElementById(HOST_ID)) return;
  registerFont();
  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.cssText =
    "position:fixed;top:0;right:0;bottom:0;width:0;height:100vh;z-index:2147483646;pointer-events:none;";
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = __SIDEBAR_CSS__;
  shadow.appendChild(style);

  const mountPoint = document.createElement("div");
  mountPoint.style.cssText = "all: initial; pointer-events: none;";
  // Keep host-page inherited styles (font-size, color, direction…) out.
  style.textContent += ":host{all:initial;}";
  shadow.appendChild(mountPoint);

  createRoot(mountPoint).render(<SidebarRoot />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount, { once: true });
} else {
  mount();
}
