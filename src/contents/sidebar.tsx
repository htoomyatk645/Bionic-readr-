import cssText from "data-text:~style.css";
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo";
import { useEffect, useState } from "react";
import { Sidebar } from "~ui/sidebar/Sidebar";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false,
  run_at: "document_idle"
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 0;
      height: 100vh;
      z-index: 2147483646;
      pointer-events: none;
    }
    ${cssText}
  `;
  return style;
};

const TOGGLE_MESSAGE_TYPE = "bionic-redr.toggle-sidebar";
const CLOSE_MESSAGE_TYPE = "bionic-redr.close-sidebar";
const LOG = "[bionic-redr/sidebar]";

export default function SidebarRoot() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.info(LOG, "mounted on", window.location.hostname);
    const c = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
    if (!c?.runtime?.onMessage) {
      console.warn(LOG, "chrome.runtime.onMessage unavailable — extension API not exposed");
      return;
    }

    const handler = (
      message: { type?: string } | null,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: unknown) => void
    ) => {
      if (!message || typeof message !== "object") return false;
      console.debug(LOG, "received message", message);
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
      console.warn(LOG, "failed to register message listener", err);
    }

    return () => {
      try {
        c.runtime.onMessage.removeListener(handler);
      } catch {
        /* extension context invalidated — ignore */
      }
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.shiftKey && (e.key === "B" || e.key === "b" || e.code === "KeyB")) {
        e.preventDefault();
        e.stopPropagation();
        console.info(LOG, "shortcut Ctrl/Cmd+Shift+B");
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return <Sidebar open={open} onClose={() => setOpen(false)} />;
}
