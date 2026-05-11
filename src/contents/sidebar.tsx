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
    console.info(LOG, "mounted on", window.location.hostname);
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
      if (meta && e.shiftKey && (e.key === "B" || e.key === "b" || e.code === "KeyB")) {
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

function mount() {
  if (document.getElementById(HOST_ID)) return;
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
  shadow.appendChild(mountPoint);

  createRoot(mountPoint).render(<SidebarRoot />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount, { once: true });
} else {
  mount();
}
